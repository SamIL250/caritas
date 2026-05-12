export {
  sendMail,
  getMailTransporter,
  resetMailTransporterCache,
  resolveDefaultMailFrom,
  isMailFailure,
} from "./send-mail";
export type { MailSendResult, MailFailure, SendMailOptions } from "./send-mail";
