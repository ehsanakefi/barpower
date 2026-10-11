// import {
//   PrismaClient,
//   UserRole,
//   DocumentStatus,
//   ChunkType,
// } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Starting seed...");

//   // پاک کردن داده‌ها به ترتیب وابستگی
//   await prisma.embedding.deleteMany();
//   await prisma.chunk.deleteMany();
//   await prisma.documentVersion.deleteMany();
//   await prisma.document.deleteMany();
//   await prisma.user.deleteMany();

//   console.log("Old data cleared");

//   // Hash passwords
//   const adminPassword = await bcrypt.hash("admin123", 10);
//   const viewerPassword = await bcrypt.hash("viewer123", 10);
//   const editorPassword = await bcrypt.hash("editor123", 10);

//   // Create users
//   const admin = await prisma.user.create({
//     data: {
//       name: "احسان عاکفی",
//       username: "ehsan",
//       password: adminPassword,
//       role: UserRole.ADMIN,
//       status: "ACTIVE",
//     },
//   });

//   const viewer = await prisma.user.create({
//     data: {
//       name: "علی رضایی",
//       username: "ali",
//       password: viewerPassword,
//       role: UserRole.VIEWER,
//       status: "ACTIVE",
//     },
//   });

//   const editor = await prisma.user.create({
//     data: {
//       name: "رضا حسنی",
//       username: "reza",
//       password: editorPassword,
//       role: UserRole.EDITOR,
//       status: "ACTIVE",
//     },
//   });

//   console.log("Users created");

//   // Create documents
//   // const doc1 = await prisma.document.create({
//   //   data: {
//   //     title: 'Introduction to Node.js',
//   //     doc_code: 'NODE101',
//   //     issue_date: new Date('2023-01-01'),
//   //     issue_date_jalali: '1401/10/11',
//   //     status: DocumentStatus.ACTIVE,
//   //     createdById: admin.id,
//   //   },
//   // });

//   // const doc2 = await prisma.document.create({
//   //   data: {
//   //     title: 'Understanding PostgreSQL',
//   //     doc_code: 'PGSQL101',
//   //     issue_date: new Date('2023-02-01'),
//   //     issue_date_jalali: '1401/11/12',
//   //     status: DocumentStatus.ACTIVE,
//   //     createdById: editor.id,
//   //   },
//   // });

//   // const doc3 = await prisma.document.create({
//   //   data: {
//   //     title: 'Prisma ORM Guide',
//   //     doc_code: 'PRISMA101',
//   //     issue_date: new Date('2023-03-01'),
//   //     issue_date_jalali: '1401/12/10',
//   //     status: DocumentStatus.ACTIVE,
//   //     createdById: admin.id,
//   //   },
//   // });

//   // console.log('Documents created');

//   // // Create document versions
//   // const doc1v1 = await prisma.documentVersion.create({
//   //   data: {
//   //     documentId: doc1.id,
//   //     versionNumber: 1,
//   //     file_url: 'https://cdn.example.com/docs/NODE101-v1.pdf',
//   //     file_size: 1024000,
//   //     uploadedById: admin.id,
//   //   },
//   // });

//   // const doc1v2 = await prisma.documentVersion.create({
//   //   data: {
//   //     documentId: doc1.id,
//   //     versionNumber: 2,
//   //     file_url: 'https://cdn.example.com/docs/NODE101-v2.pdf',
//   //     file_size: 1200000,
//   //     uploadedById: editor.id,
//   //   },
//   // });

//   // const doc2v1 = await prisma.documentVersion.create({
//   //   data: {
//   //     documentId: doc2.id,
//   //     versionNumber: 1,
//   //     file_url: 'https://cdn.example.com/docs/PGSQL101-v1.pdf',
//   //     file_size: 980000,
//   //     uploadedById: editor.id,
//   //   },
//   // });

//   // const doc3v1 = await prisma.documentVersion.create({
//   //   data: {
//   //     documentId: doc3.id,
//   //     versionNumber: 1,
//   //     file_url: 'https://cdn.example.com/docs/PRISMA101-v1.pdf',
//   //     file_size: 1100000,
//   //     uploadedById: admin.id,
//   //   },
//   // });

//   // console.log('Document versions created');

//   // // Create chunks
//   // const chunk1 = await prisma.chunk.create({
//   //   data: {
//   //     documentId: doc1.id,
//   //     versionId: doc1v1.id,
//   //     pageNumber: 1,
//   //     chunkIndex: 1,
//   //     type: ChunkType.PARAGRAPH,
//   //     text: 'Node.js is a JavaScript runtime built on Chrome V8 engine.',
//   //     normalizedText: 'node.js is a javascript runtime built on chrome v8 engine',
//   //     paragraphStart: 0,
//   //     paragraphEnd: 60,
//   //     charLength: 61,
//   //     metadata: {
//   //       section: 'Introduction',
//   //       language: 'en',
//   //     },
//   //   },
//   // });

//   // const chunk2 = await prisma.chunk.create({
//   //   data: {
//   //     documentId: doc1.id,
//   //     versionId: doc1v1.id,
//   //     pageNumber: 2,
//   //     chunkIndex: 2,
//   //     type: ChunkType.RAG,
//   //     text: 'Node.js uses an event-driven, non-blocking I/O model.',
//   //     normalizedText: 'node.js uses an event-driven non-blocking io model',
//   //     paragraphStart: 61,
//   //     paragraphEnd: 120,
//   //     charLength: 58,
//   //     metadata: {
//   //       section: 'Architecture',
//   //       difficulty: 'medium',
//   //     },
//   //   },
//   // });

//   // const chunk3 = await prisma.chunk.create({
//   //   data: {
//   //     documentId: doc2.id,
//   //     versionId: doc2v1.id,
//   //     pageNumber: 1,
//   //     chunkIndex: 1,
//   //     type: ChunkType.PARAGRAPH,
//   //     text: 'PostgreSQL is a powerful, open source object-relational database system.',
//   //     normalizedText: 'postgresql is a powerful open source object relational database system',
//   //     paragraphStart: 0,
//   //     paragraphEnd: 78,
//   //     charLength: 79,
//   //     metadata: {
//   //       section: 'Overview',
//   //       language: 'en',
//   //     },
//   //   },
//   // });

//   // const chunk4 = await prisma.chunk.create({
//   //   data: {
//   //     documentId: doc3.id,
//   //     versionId: doc3v1.id,
//   //     pageNumber: 1,
//   //     chunkIndex: 1,
//   //     type: ChunkType.RETRIEVAL,
//   //     text: 'Prisma is a next-generation ORM for Node.js and TypeScript.',
//   //     normalizedText: 'prisma is a next generation orm for node.js and typescript',
//   //     paragraphStart: 0,
//   //     paragraphEnd: 65,
//   //     charLength: 66,
//   //     metadata: {
//   //       section: 'Getting Started',
//   //       tags: ['orm', 'typescript', 'nodejs'],
//   //     },
//   //   },
//   // });

//   // console.log('Chunks created');

//   // // Create embeddings
//   // await prisma.embedding.create({
//   //   data: {
//   //     chunkId: chunk1.id,
//   //     vector: [0.12, -0.45, 0.88, 0.31, -0.09],
//   //     model: 'text-embedding-3-large',
//   //   },
//   // });

//   // await prisma.embedding.create({
//   //   data: {
//   //     chunkId: chunk2.id,
//   //     vector: [0.22, -0.15, 0.18, 0.71, -0.29],
//   //     model: 'text-embedding-3-large',
//   //   },
//   // });

//   // await prisma.embedding.create({
//   //   data: {
//   //     chunkId: chunk3.id,
//   //     vector: [0.05, -0.25, 0.91, 0.44, -0.11],
//   //     model: 'text-embedding-3-large',
//   //   },
//   // });

//   // await prisma.embedding.create({
//   //   data: {
//   //     chunkId: chunk4.id,
//   //     vector: [0.33, -0.05, 0.67, 0.21, -0.49],
//   //     model: 'text-embedding-3-large',
//   //   },
//   // });

//   console.log("Embeddings created");

//   console.log("Seed completed successfully ✅");
//   console.log({
//     users: {
//       admin: admin.username,
//       viewer: viewer.username,
//       editor: editor.username,
//     },
//     // documents: [doc1.doc_code, doc2.doc_code, doc3.doc_code],
//   });
// }

// main()
//   .catch((e) => {
//     console.error("Seed error:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
