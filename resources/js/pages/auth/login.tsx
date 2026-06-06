import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to Tanse Alsen 22" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-12 text-base px-4 border-neutral-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm text-indigo-650 hover:text-indigo-850" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-12 text-base px-4 border-neutral-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 py-1 select-none">
                        <Checkbox 
                            id="remember" 
                            name="remember" 
                            tabIndex={3} 
                            className="size-5 border-neutral-350 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', !!checked)}
                        />
                        <Label htmlFor="remember" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-2" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                        Log in
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
