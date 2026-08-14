import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { Form } from '../../components/form/Form';
import { FormInput } from '../../components/form/FormInput';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { resetPasswordSchema, ResetPasswordSchemaType } from '../../schemas/auth.schema';
import { useResetPassword } from '../../hooks/auth/useAuthMutations';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo_reset_token';
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (values: ResetPasswordSchemaType) => {
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setIsSuccess(true);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Card className="shadow-xl border-[var(--border)] bg-[var(--card)]">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="font-serif text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription className="font-mono-meta text-[10px] text-[var(--gold)] font-semibold tracking-widest">
          NEW CREDENTIAL ASSIGNMENT
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-xl font-bold text-[var(--foreground)]">Password Reset Complete</h4>
            <p className="text-xs font-body text-[var(--muted-foreground)]">
              Your security credentials have been updated successfully. You may now sign in.
            </p>
            <div className="pt-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate('/auth/login')}
              >
                Proceed to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <Form schema={resetPasswordSchema} onSubmit={handleSubmit}>
            {() => (
              <div className="space-y-4 font-body">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  Please enter and confirm your new password. Ensure it meets all complexity rules.
                </p>

                <FormInput
                  name="password"
                  label="New Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  description="At least 8 chars, 1 uppercase, 1 number, 1 special char"
                  leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
                />

                <FormInput
                  name="confirmPassword"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
                />

                <Button
                  type="submit"
                  variant="default"
                  className="w-full mt-2"
                  isLoading={resetPasswordMutation.isPending}
                  rightIcon={<KeyRound className="h-4 w-4" />}
                >
                  Reset Password
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--gold)] hover:underline font-medium"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            )}
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
