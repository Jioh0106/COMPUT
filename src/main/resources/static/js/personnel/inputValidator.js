//
export {allowKoAndEn,allowKoAndEnAndNumbers,allowOnlyNumbers,validatePassword};

//---------------------------------------------------------------------------------------------------------------------
// 한글,영어만 허용
// 한글, 영어만 허용
function allowKoAndEn(value) {
  const koEnPattern = /^[가-힣a-zA-Z]+$/; // 한글과 영어만 허용
  return koEnPattern.test(value);
}

// 한글, 영어, 숫자만 허용
function allowKoAndEnAndNumbers(value) {
  const koEnNumPattern = /^[가-힣a-zA-Z0-9]+$/; // 한글, 영어, 숫자만 허용
  return koEnNumPattern.test(value);
}

// 숫자 입력만 허용 (공백 허용 안 함)
function allowOnlyNumbers(value) {
  const numericPattern = /^\d+$/; // 숫자만 허용
  return numericPattern.test(value);
}

// 비밀번호 강도 검사
function validatePassword(password) {
  // 최소 8자, 대문자/소문자/숫자/특수문자 포함
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordPattern.test(password);
}


