import { ForbiddenException } from "@nestjs/common";
import { Actor } from "../modules/auth/interfaces/actor.interface";
export function role(user: Actor, ...roles: string[]) {
  if (!roles.includes(user.role))
    throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
}
