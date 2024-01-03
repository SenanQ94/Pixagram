import { Button } from "@/components/ui/button";
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
import {
  useResetPassword,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({
    message: "Please use a valid email.",
  }),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { mutateAsync: resetPassword, isPending: resetPasswordLoading } =
    useResetPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await resetPassword(values.email);
    navigate("/sign-in");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We'll send you a link to reset your password. Please check your
                email for further instructions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="outline" type="submit">
          Send
        </Button>
      </form>
    </Form>
  );
};

export default ResetPassword;
