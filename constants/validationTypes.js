import * as Yup from 'yup'
import t from '@config/i18n'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 32

const nameRegex = new RegExp(/[^ -~]+/g)
const passwordRegex = new RegExp(/((?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]))/)

const validationTypes = {
  email: Yup.string()
    .email(t('formErrors/validEmail'))
    .required(t('formErrors/emailIsRequired')),
  loginPassword: Yup.string()
    .min(
      PASSWORD_MIN_LENGTH,
      t('formErrors/passwordMinLength', { length: PASSWORD_MIN_LENGTH })
    )
    .required(t('formErrors/passwordRequired')),
  password: Yup.string()
    .required(t('formErrors/passwordRequired'))
    .min(
      PASSWORD_MIN_LENGTH,
      t('formErrors/passwordMinLength', { length: PASSWORD_MIN_LENGTH })
    )
    .max(
      PASSWORD_MAX_LENGTH,
      t('formErrors/passwordMaxLength', { length: PASSWORD_MAX_LENGTH })
    )
    .matches(passwordRegex, t('formErrors/passwordRulesError')),
  name: Yup.string()
    .required()
    .min(2)
    .max(50)
    .matches(nameRegex),
  title: Yup.string()
    .min(1)
    .max(300),
  body: Yup.string()
    .min(1)
    .max(63206),
}

export default validationTypes
