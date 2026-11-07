export interface Actor {
  id: string;
  role: "buyer" | "artisan" | "admin";
  name: string;
  email: string;
}
