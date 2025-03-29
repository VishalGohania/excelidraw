"use client"
import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function Signup() {
    interface FormValues {
        Name: string;
        Email: string;
        password: string;
    }
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

    const router = useRouter();

    const handleClick = () => {
        router.push("/signin");
    };

    const formSubmit = async (data: FormValues) => {
        try {
            const response = await axios.post(`${HTTP_BACKEND}/signup`, {
                username: data.Email,
                password: data.password,
                name: data.Name,
            });

            if (response.data.status) {
                toast.success(response.data.message);
                router.push("/signin");
            } else {
                toast.error(response.data.message);
            }
        } catch (error: any) {
            if (error.response) {
                toast.error(error.response.data.message);
            } else if (error.request) {
                toast.error("No response from server. Please try again later.");
            } else {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full rounded border border-gray-800 px-10 py-10 mt-10 bg-[#0E131E] max-w-[500px] mx-auto">
            <div className="h-10 w-10 mb-8 flex items-center justify-center rounded-full bg-[#0F2139]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#0077FF" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            </div>
            <h1 className="text-2xl font-semibold">Create new Account</h1>
            <p className="text-gray-400 text-sm pt-2 pb-6">Enter your credentials to create your account</p>
            <form onSubmit={handleSubmit(formSubmit)} className="w-full">
                <div className="my-4">
                    <label className="font-medium">Name</label>
                    <div className={`bg-[#151D2C] mt-2 rounded-lg p-3 ${errors.Name ? 'border border-red-600' : ''}`}>
                        <input className="focus:outline-none w-full text-white bg-transparent" placeholder="Full Name" type="text" {...register('Name', {
                            required: { value: true, message: "Required" },
                            minLength: { value: 3, message: "Minimum 3 characters" },
                            maxLength: { value: 20, message: "Limit 20 characters" }
                        })} />
                    </div>
                    {errors.Name && <p className="text-red-600">{errors.Name.message}</p>}
                </div>
                <div className="my-4">
                    <label className="font-medium">Email</label>
                    <div className={`bg-[#151D2C] mt-2 rounded-lg p-3 ${errors.Email ? 'border border-red-600' : ''}`}>
                        <input className="focus:outline-none w-full text-white bg-transparent" placeholder="name@example.com" type="email" {...register('Email', {
                            required: { value: true, message: "Required" },
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                        })} />
                    </div>
                    {errors.Email && <p className="text-red-600">{errors.Email.message}</p>}
                </div>
                <div className="my-4">
                    <label>Password</label>
                    <div className={`bg-[#151D2C] mt-2 rounded-lg p-3 ${errors.password ? 'border border-red-600' : ''}`}>
                        <input className="focus:outline-none w-full text-white bg-transparent" placeholder="*******" type="password" {...register('password', {
                            required: { value: true, message: "Required" },
                            minLength: { value: 3, message: "Minimum 3 characters" },
                            maxLength: { value: 20, message: "Maximum 20 characters" }
                        })} />
                    </div>
                    {errors.password && <p className="text-red-600">{errors.password.message}</p>}
                </div>
                <button className="relative w-full bg-[#0077FF] py-3 rounded-lg font-medium flex justify-center items-center" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create account'}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="ml-2 size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                </button>
            </form>
            <p className="text-center mt-4">Already have an account? <span onClick={handleClick} className="cursor-pointer text-[#0077FF]">Sign in</span></p>
        </div>
    );
}

export default Signup;