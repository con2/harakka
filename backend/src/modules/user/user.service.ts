import { Injectable, Logger } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "./interfaces/user.interface";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
  UserResponse,
} from "@supabase/supabase-js";
import { CreateAddressDto } from "./dto/create-address.dto";
import WelcomeEmail from "src/emails/WelcomeEmail";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UserService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserService.name);

  constructor(
    private supabaseService: SupabaseService,
    private readonly mailService: MailService,
  ) {
    // Major Issue, anyone can see everything.
    this.supabase = supabaseService.getServiceClient(); // Use the service client for admin operations
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error }: PostgrestResponse<User> = await this.supabase
      .from("user_profiles")
      .select("*");
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error }: PostgrestSingleResponse<User> = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    try {
      // First, check if user already exists to provide better error message
      const { data: existingUser } = await this.supabase
        .from("user_profiles")
        .select("id")
        .eq("email", user.email)
        .single();

      if (existingUser) {
        throw new Error(`Email ${user.email} is already registered`);
      }

      // Log the attempt to create a user
      this.logger.log(`Attempting to create user with email: ${user.email}`);

      // send mail to user
      console.log(`User: ${user}`);
   /*    try {
        await this.mailService.sendMail({
          to: user.email,
          subject: "Welcome, friend!",
          template: WelcomeEmail({ name: user.email }),
        });
      } catch (mailError) {
        this.logger.error(
          `Sending welcome email failed: ${
            mailError instanceof Error
              ? mailError.message
              : JSON.stringify(mailError)
          }`,
        );
      }
 */
      // Create a user in Supabase Auth
      const { data: authData, error: authError }: UserResponse =
        await this.supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Auto-confirm email for now
        });

      if (authError) {
        this.logger.error(`Supabase Auth Error: ${JSON.stringify(authError)}`);

        // Handle specific error cases
        if (
          authError.message &&
          (authError.message.includes("email") ||
            authError.message.includes("already registered") ||
            authError.message.includes("already exists"))
        ) {
          throw new Error(`Email ${user.email} is already registered`);
        }

        // For 500 errors, more helpful messages
        if (authError.status === 500) {
          this.logger.error(
            "Supabase server error. Check your configuration and Supabase service status.",
          );
          throw new Error(
            "Unable to create user account due to a service error. Please try again later.",
          );
        }

        throw new Error(authError.message || "Error creating user");
      }

      // Check if profile was already created by the database trigger
      const {
        data: existingProfile,
        error: profileError,
      }: PostgrestSingleResponse<User> = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        this.logger.error(
          `Error checking for existing profile: ${JSON.stringify(profileError)}`,
        );
        throw new Error(
          profileError.message || "Error checking for existing user profile",
        );
      }

      if (existingProfile) {
        // Profile already exists (created by trigger), update it with additional information
        const { data, error: updateError }: PostgrestSingleResponse<User> =
          await this.supabase
            .from("user_profiles")
            .update({
              full_name: user.full_name,
              visible_name: user.visible_name,
              role: user.role || "user",
              phone: user.phone,
              preferences: user.preferences || {},
            })
            .eq("id", authData.user.id)
            .select()
            .single();

        if (updateError) {
          this.logger.error(
            `Profile Update Error: ${JSON.stringify(updateError)}`,
          );
          throw new Error(
            updateError.message || `Error updating profile for ${user.email}`,
          );
        }

        return data;
      } else {
        // Profile doesn't exist yet, create it
        const { data, error: profileError }: PostgrestSingleResponse<User> =
          await this.supabase
            .from("user_profiles")
            .insert([
              {
                id: authData.user.id, // Auth-generated user ID
                role: user.role || "user",
                full_name: user.full_name,
                visible_name: user.visible_name,
                phone: user.phone,
                email: user.email,
                preferences: user.preferences || {},
              },
            ])
            .select()
            .single();

        if (profileError) {
          this.logger.error(
            `Supabase Profile Insert Error: ${JSON.stringify(profileError)}`,
          );
          // Fix: Use a default message if no message property exists
          throw new Error(
            profileError.message || `Error creating profile for ${user.email}`,
          );
        }

        return data;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.log(
        `User creation failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    const { data, error }: PostgrestSingleResponse<User> = await this.supabase
      .from("user_profiles")
      .update(user)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_profiles")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);

    // Also delete from auth.users
    /* const { error: authError } = await this.supabase.auth.admin.deleteUser(id);
    if (authError) throw new Error(authError.message); */
  }

  // get all addresses for a specific user
  async getAddressesByid(id: string): Promise<any[]> {
    const { data, error }: PostgrestResponse<any> = await this.supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", id);
    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  // add a new address
  async addAddress(id: string, address: CreateAddressDto): Promise<any> {
    const { data, error }: PostgrestSingleResponse<any> = await this.supabase
      .from("user_addresses")
      .insert([{ ...address, user_id: id }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // update an existing address
  async updateAddress(
    id: string,
    addressId: string,
    address: CreateAddressDto,
  ): Promise<any> {
    const { data, error }: PostgrestSingleResponse<any> = await this.supabase
      .from("user_addresses")
      .update(address)
      .eq("user_id", id)
      .eq("id", addressId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // delete an address
  async deleteAddress(id: string, addressId: string): Promise<void> {
    const { error } = await this.supabase
      .from("user_addresses")
      .delete()
      .eq("user_id", id)
      .eq("id", addressId);
    if (error) throw new Error(error.message);
  }

  /* async sendWelcomeEmail(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user || !user.email) {
      this.logger.warn(`Cannot send welcome email. User not found: ${userId}`);
      return;
    }

    await this.mailService.sendMail({
      to: user.email,
      subject: "Welcome, friend!",
      template: WelcomeEmail({ name: user.name || user.email }),
    });
  } */
}
