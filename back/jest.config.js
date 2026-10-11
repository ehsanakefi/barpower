// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   testMatch: ["**/test/**/*.test.ts"],
//   moduleFileExtensions: ["ts", "js", "json"],
//   transform: {
//     "^.+\\.ts$": "ts-jest",
//   },
//   verbose: true,
//   forceExit: true,
// };
// module.exports = {
//   testEnvironment: "node",
//   testMatch: ["**/test/**/*.test.ts"],
//   transform: {
//     "^.+\\.tsx?$": [
//       "ts-jest", // صبر کنید، چون ts-jest را حذف کردیم از ts-node استفاده میکنیم:
//     ],
//   },
// };
// module.exports = {
//   testEnvironment: "node",
//   testMatch: ["**/test/**/*.test.ts"],
//   transform: {
//     "^.+\\.tsx?$": ["ts-node", {}],
//   },
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
// module.exports = {
//   testEnvironment: "node",
//   testMatch: ["**/test/**/*.test.ts"],
//   transform: {
//     "^.+\\.(t|j)s$": [
//       "@swc/jest",
//       {
//         jsc: {
//           parser: {
//             syntax: "typescript",
//             tsx: false,
//             decorators: true,
//           },
//           target: "es2021",
//         },
//       },
//     ],
//   },
//   moduleFileExtensions: ["ts", "js", "json"],
// };
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  moduleNameMapper: {
    "^@prisma/client$": "<rootDir>/node_modules/@prisma/client",
    "^.prisma/client/default$":
      "<rootDir>/node_modules/.prisma/client/index.js",
  },
};
