import { Body, CanActivate, Controller, ExecutionContext, Get, Injectable, Post, Req, UnauthorizedException, ConflictException, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';
import { Database } from './database';
import { parse, text } from './validation';
export type Actor = { id:string; role:'buyer'|'artisan'|'admin'; name:string; email:string };
export function role(user:Actor, ...roles:string[]) { if (!roles.includes(user.role)) throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này'); }
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt:JwtService, private readonly db:Database) {}
  async canActivate(ctx:ExecutionContext) {
    const req=ctx.switchToHttp().getRequest();
    try {
      const header=req.headers.authorization;
      if (!header?.startsWith('Bearer ')) throw new Error();
      const payload=await this.jwt.verifyAsync(header.slice(7));
      const user=await this.db.users.findOne({_id:payload.sub,active:true}).lean();
      if(!user) throw new Error();
      req.user={id:String(user._id),name:user.name,email:user.email,role:user.role}; return true;
    } catch { throw new UnauthorizedException('Vui lòng đăng nhập lại'); }
  }
}
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly db:Database,private readonly jwt:JwtService) {}
  @Post('register') async register(@Body() body:unknown) {
    const data=parse(z.object({name:text(100),email:z.string().email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(10).max(72)}).strict(),body);
    try { const user=await this.db.users.create({name:data.name,email:data.email,passwordHash:await hash(data.password,12),role:'buyer'});return this.session(user); }
    catch(e:any){if(e.code===11000)throw new ConflictException('Email đã được đăng ký');throw e;}
  }
  @Post('login') async login(@Body() body:unknown) {
    const data=parse(z.object({email:z.string().email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(1).max(72)}).strict(),body);
    const user=await this.db.users.findOne({email:data.email,active:true}).select('+passwordHash');
    if(!user || !await compare(data.password,user.passwordHash))throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    return this.session(user);
  }
  private async session(user:any){const actor={id:String(user._id),name:user.name,email:user.email,role:user.role};return {user:actor,token:await this.jwt.signAsync({sub:actor.id})};}
  @Get('me') @ApiBearerAuth() @UseGuards(AuthGuard) me(@Req() req:any){return req.user;}
}
