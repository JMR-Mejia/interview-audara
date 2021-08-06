exports.rateValidations = {
  name: "required|min:2|max:32|type:alphaNumericDash",
  prefix: 'max:20|type:numeric',
  number_of_digits: 'max:20|type:numeric',
  min_rate: 'max:2000|type:numeric',
  sec_rate: 'max:2000|type:numeric',
  currency_id: 'max:100|type:numeric',
};
