```javascript
npm init -y
npm install typescript tsx @types/node --save-dev
npx tsc --init

npm install prisma @types/node @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv

// tsconfig.json, package.json config
npx prisma
npx prisma init --datasource-provider postgresql --output ../generated/prisma

npx prisma migrate dev --name init
npx prisma generate


pnpm add better-auth
npx prisma generate
npx prisma migrate dev

BETTER_AUTH_SECRET=VXy3RIZgAnQVxnu22WIcnBaN9rIuT60A
BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app

npx @better-auth/cli generate
npx prisma generate
npx prisma migrate dev
```
