import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => {
  return {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    jtwTtl: Number(process.env.JWT_TTL ?? '3600'),
    jtwRefresh: Number(process.env.JWT_REFRESH_TTL ?? '86400'),
  };
});
