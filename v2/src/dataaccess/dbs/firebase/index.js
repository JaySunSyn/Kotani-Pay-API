const createAuth = (user) => new Promise((resolve) => {
  admin
    .auth()
    .createUser({
      uid: user.uid,
      phoneNumber: `+${user.phoneNumber}`,
      disabled: user.disabled,
    })
    .then((userRecord) => {
      admin
        .auth()
        .setCustomUserClaims(userRecord.uid, { verifieduser: false });
      console.log('Successfully created new user:', userRecord.uid);
      resolve(userRecord.uid);
    })
    .catch((error) => {
      console.log('Error creating new user:', error);
    });
});
