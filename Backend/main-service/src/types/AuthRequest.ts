export interface AuthRequest extends Request {
    user?: {
      id?: string;
      email?: string;
      accountType?: string;
    };
    body: {
      oldPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    };
  }