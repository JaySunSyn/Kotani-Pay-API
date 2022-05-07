const makeUser = ({
  fullName, docType, docNumber, dob, gender, email
}) => {
  if (!fullName || !docType || !docNumber || !dob || !gender || !email) {
    throw new Error(' Missing required Input');
  }

  return Object.freeze({
    fullName,
    docType,
    docNumber,
    gender,
    dob,
    email
  });
};
