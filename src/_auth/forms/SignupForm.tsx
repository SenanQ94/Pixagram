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
import { SignupValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { ProfileUploader } from "@/components/shared";

function SignupForm() {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } =
    useCreateUserAccount();

  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
  });

  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    const image = values.image[0] || null;
    const newUser = await createUserAccount({ ...values, image });
    if (!newUser) {
      return toast({
        title: "Sign up faild. Please try again.",
        description:
          "Oops, it seems there was an issue with signing you up. Please try again, and if the problem persists, feel free to contact our support team for assistance.",
      });
    }
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

  return (
    <Form {...form}>
      <div className="h-full w-[50%] flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

        <h2 className="h3-bold xl:pt-2 lg:pt-1 md:h2-bold lg:h3-bold  sm:pt-12">
          Create a new account
        </h2>
        <p className="text-light-3 lg:small-medium md:base-regular mt-1">
          To use Pixagram, Please enter your details
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col px-5 gap-2 w-full mt-2 h-full overflow-y-auto custom-scrollbar"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ProfileUploader
                    fieldChange={field.onChange}
                    mediaUrl={
                       "/assets/icons/profile-placeholder.svg"
                    }
                    register={true}
                  />
                </FormControl>
                <FormMessage className="flex-center" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input
                    type="password"
                    className="shad-input hide-password-toggle pr-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary">
            {isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>
        <p className="text-small-regular text-light-2 text-center mt-2">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="text-primary-500 text-small-semibold ml-1"
          >
            Log in
          </Link>
        </p>
      </div>
    </Form>
  );
}

export default SignupForm;
