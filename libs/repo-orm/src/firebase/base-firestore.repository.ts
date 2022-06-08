// import * as admin from 'firebase-admin';
//
// const firestore = admin.firestore();
//
// export class BaseFirestoreRepository {
//
//
//   checkIfUserExists = async (userId) => {
//     let exists;
//     return new Promise((resolve) => {
//       admin
//         .auth()
//         .getUser(userId)
//         .then(function (userRecord) {
//           if (userRecord) {
//             exists = true;
//             resolve(exists);
//           } else {
//             exists = false;
//             resolve(exists);
//           }
//         })
//         .catch(function (error) {
//           console.log(
//             'Error fetching user data:',
//             userId,
//             'does not exists:\n',
//           );
//           exists = false;
//           resolve(exists);
//         });
//     });
//   };
//
//   getUserDetails = async (senderId) => {
//     const db = firestore.collection('accounts').doc(senderId);
//     const result = await db.get();
//     return result;
//   };
//
//   checkisUserKyced = async (userId) => {
//     const docRef = firestore.collection('kycdb').doc(userId);
//     let isKyced = false;
//
//     const doc = await docRef.get();
//     if (!doc.exists) {
//       isKyced = false; // Run KYC
//       console.log('No such document!');
//     } else {
//       isKyced = true; // do nothing
//       console.log('KYC Document Exists => ', JSON.stringify(doc.data()));
//     }
//     return isKyced;
//   };
// }
