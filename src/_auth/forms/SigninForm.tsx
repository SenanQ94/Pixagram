import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SigninValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateUserAccount,
  useSignInAccount,
  useSignInAccountUsingGoogle,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";

function SigninForm() {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: signInAccount, isPending: signInLoading } =
    useSignInAccount();
  const { mutateAsync: signInAccountGoogle, isPending: googleSignInLoading } =
    useSignInAccountUsingGoogle();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    });
    if (!session) {
      return toast({
        title: "Sign in faild. Please try again.",
        description:
          "Oops, it seems there was an issue with signing you in. Please try again, and if the problem persists, feel free to contact our support team for assistance.",
      });
    }
    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      form.reset();
      navigate("/");
    } else {
      return toast({
        title: "Sign in faild. Please try again.",
        description:
          "Oops, it seems there was an issue with signing you in. Please try again, and if the problem persists, feel free to contact our support team for assistance.",
      });
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInAccountGoogle();
      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        return toast({
          variant: 'default',
          title: "Sign in faild. Please try again.",
          description:
            "Oops, it seems there was an issue with signing you in. Please try again, and if the problem persists, feel free to contact our support team for assistance.",
        });
      }
    } catch (error) {
      // Handle errors if needed
      console.error("Google sign-in error:", error);
    }
  };

  return isUserLoading ? (
    <Loader />
  ) : (
    <Form {...form}>
      <div className=" flex-center flex-col">
        <img src="/assets/images/logo.svg" />
        <h2 className="h3-bold xl:pt-2 lg:pt-2 md:h2-bold  sm:pt-12">
          Log in to your account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Welcome back! Please enter your details
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link
            to="/reset-password"
            className="text-primary-500 text-sm font-semibold text-center mt-1 hover:underline"
          >
            Forgot your password?
          </Link>
          <Button type="submit" className="shad-button_primary">
            {false ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <div className="flex flex-col gap-4 w-full mt-4">
          <Button
            variant="outline"
            className="flex flex-center gap-6"
            onClick={handleGoogleSignIn}
          >
            <div className="flex flex-center gap-8">
              <img src="/assets/icons/google.svg" />
            </div>
            <p>Sign in with Google</p>
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Form>
  );
}

export default SigninForm;
