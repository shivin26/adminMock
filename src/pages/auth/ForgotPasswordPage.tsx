import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Form } from '../../components/form/Form';
import { FormInput } from '../../components/form/FormInput';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { forgotPasswordSchema, ForgotPasswordSchemaType } from '../../schemas/auth.schema';
import { useForgotPassword } from '../../hooks/auth/useAuthMutations';

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = async (values: ForgotPasswordSchemaType) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: values.email });
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Card className="shadow-xl border-[var(--border)] bg-[var(--card)]">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="font-serif text-3xl font-bold">Forgot Password</CardTitle>
        <CardDescription className="font-mono-meta text-[10px] text-[var(--gold)] font-semibold tracking-widest">
          PASSWORD RECOVERY PORTAL
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-xl font-bold text-[var(--foreground)]">Check your inbox</h4>
            <p className="text-xs font-body text-[var(--muted-foreground)]">
              We've dispatched password reset instructions to{' '}
              <strong className="text-[var(--foreground)]">{submittedEmail}</strong>.
            </p>
            <div className="pt-4">
              <Link to="/auth/login">
                <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Form schema={forgotPasswordSchema} onSubmit={handleSubmit}>
            {() => (
              <div className="space-y-4 font-body">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  Enter your work email address below and we'll send you instructions to reset your account password.
                </p>

                <FormInput
                  name="email"
                  label="Work Email Address"
                  placeholder="name@digilocal.com"
                  type="email"
                  required
                  leftIcon={<Mail className="h-4 w-4 text-[var(--muted-foreground)]" />}
                />

                <Button
                  type="submit"
                  variant="default"
                  className="w-full mt-2"
                  isLoading={forgotPasswordMutation.isPending}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  Send Recovery Link
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
