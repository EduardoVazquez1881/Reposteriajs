"use client";
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Sidebar from '@/components/form/sidebar';

import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();


    const onSubmit = handleSubmit(async (data) => {
        
        if (data.password !== data.confirmPassword) {
            return alert('Las contraseñas no coinciden');
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!res.ok) {
            const error = await res.json();
            return alert(error.message || 'Algo salió mal');
        }

        if (res.ok)
        {
            router.push('/auth/login')
        }

        const resJSON = await res.json();
        console.log(resJSON);
    });

    return (
        <div className='flex'>
            <Sidebar/>
            <div className="flex-1 flex items-center justify-center">
                <form onSubmit={onSubmit} className='w-96 p-8 rounded-lg text-white flex flex-col border border-white/90 shadow-md bg-white backdrop-blur-xs hover:border-rose-500 hover:scale-105 transition-all'>
                <div className="flex justify-center space-x-4 mb-8">
                    <a href="/auth/register" className="p-4 text-xl font-bold text-rose-700  text-center border-b-2 border-rose-500">Registrar</a>
                    <a href="/auth/login" className="p-4 text-xl font-bold text-center  text-rose-400 hover:text-rose-700 hover:border-b-2 hover:border-rose-500 transition-all">Iniciar Sesión</a>
                </div>
                
                    <Label htmlFor='username'>Nombre de Usuario</Label>
                    <Input
                        type="text"
                        placeholder="Nombre de usuario"
                        {...register("username", {
                            required: {
                                value: true,
                                message: 'El nombre de usuario es requerido'
                            }
                        })}
                    />
                    {errors.username && (
                        <span className='text-red-500 text-sm'>
                            {typeof errors.username?.message === 'string' && errors.username.message}
                        </span>
                    )}

                    <Label htmlFor='email'>Correo Electrónico</Label>
                    <Input
                        type="email"
                        placeholder="usuario@gmail.com"
                        {...register("email", {
                            required: {
                                value: true,
                                message: 'El correo es requerido'
                            }
                        })}
                    />
                    {errors.email && (
                        <span className='text-red-500 text-sm'>
                            {typeof errors.email?.message === 'string' && errors.email.message}
                        </span>
                    )}

                    <Label htmlFor='password'>Contraseña</Label>
                    <Input
                        type="password"
                        placeholder="********"
                        {...register("password", {
                            required: {
                                value: true,
                                message: 'La contraseña es requerida'
                            }
                        })}
                    />
                    {errors.password && (
                        <span className='text-red-500 text-sm'>
                            {typeof errors.password?.message === 'string' && errors.password.message}
                        </span>
                    )}

                    <Label htmlFor='confirmPassword'>Confirmar Contraseña</Label>
                    <Input
                        type="password"
                        placeholder="********"
                        {...register("confirmPassword", {
                            required: {
                                value: true,
                                message: 'La confirmación de contraseña es requerida'
                            }
                        })}
                    />
                    {errors.confirmPassword && (
                        <span className='text-red-500 text-sm'>
                            {typeof errors.confirmPassword?.message === 'string' && errors.confirmPassword.message}
                        </span>
                    )}

                    <Button type="submit">
                        Registrar
                    </Button>
                </form>
                <Image  src="/login.svg"   
                alt="Logo de la repostería"  
                className="fixed w-4/8 -z-10 rounded-4xl"/>
            </div>    
        </div>
    );
}