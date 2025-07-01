export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          order_id: string | null
          pdf_url: string | null
          reference_number: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          order_id?: string | null
          pdf_url?: string | null
          reference_number?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          order_id?: string | null
          pdf_url?: string | null
          reference_number?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "test_booking_with_user_and_location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          id: string
          name: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          name: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          item_id: string | null
          message: string
          order_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message: string
          order_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message?: string
          order_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "test_booking_with_user_and_location"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          location_id: string
          order_id: string
          quantity: number | null
          start_date: string
          status: string
          subtotal: number | null
          total_days: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          location_id: string
          order_id: string
          quantity?: number | null
          start_date: string
          status: string
          subtotal?: number | null
          total_days: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          location_id?: string
          order_id?: string
          quantity?: number | null
          start_date?: string
          status?: string
          subtotal?: number | null
          total_days?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "test_booking_with_user_and_location"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_code: string | null
          final_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_details: Json | null
          payment_status: string | null
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_details?: Json | null
          payment_status?: string | null
          status: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_details?: Json | null
          payment_status?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          order_id: string
          payment_date: string
          payment_method: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          payment_date: string
          payment_method: string
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_date?: string
          payment_method?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "test_booking_with_user_and_location"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          created_at: string | null
          description: string
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          starts_at: string
          times_used: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          discount_type: string
          discount_value: number
          expires_at: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          starts_at: string
          times_used?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          starts_at?: string
          times_used?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          item_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          item_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          item_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["role_type"]
        }
        Relationships: []
      }
      saved_list_items: {
        Row: {
          added_at: string | null
          id: string
          item_id: string
          list_id: string
          notes: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          item_id: string
          list_id: string
          notes?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          item_id?: string
          list_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "saved_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      storage_compartments: {
        Row: {
          created_at: string | null
          id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Relationships: []
      }
      storage_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number
          id: string
          image_type: string
          image_url: string
          is_active: boolean | null
          location_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_type: string
          image_url: string
          is_active?: boolean | null
          location_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_type?: string
          image_url?: string
          is_active?: boolean | null
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_images_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_item_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number
          id: string
          image_type: string
          image_url: string
          is_active: boolean | null
          item_id: string
          storage_path: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_type: string
          image_url: string
          is_active?: boolean | null
          item_id: string
          storage_path?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_type?: string
          image_url?: string
          is_active?: boolean | null
          item_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_item_tags: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          tag_id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          tag_id: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          tag_id?: string
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_items: {
        Row: {
          average_rating: number | null
          compartment_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          items_number_available: number
          items_number_currently_in_storage: number | null
          items_number_total: number
          location_id: string
          price: number
          translations: Json | null
        }
        Insert: {
          average_rating?: number | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          items_number_available: number
          items_number_currently_in_storage?: number | null
          items_number_total: number
          location_id: string
          price: number
          translations?: Json | null
        }
        Update: {
          average_rating?: number | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          items_number_available?: number
          items_number_currently_in_storage?: number | null
          items_number_total?: number
          location_id?: string
          price?: number
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "storage_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      storage_working_hours: {
        Row: {
          close_time: string
          created_at: string | null
          day: string
          id: string
          is_active: boolean | null
          location_id: string
          open_time: string
        }
        Insert: {
          close_time: string
          created_at?: string | null
          day: string
          id?: string
          is_active?: boolean | null
          location_id: string
          open_time: string
        }
        Update: {
          close_time?: string
          created_at?: string | null
          day?: string
          id?: string
          is_active?: boolean | null
          location_id?: string
          open_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_working_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_type: string
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_type: string
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_type?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          role: string
          saved_lists: Json | null
          visible_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferences?: Json | null
          role?: string
          saved_lists?: Json | null
          visible_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string
          saved_lists?: Json | null
          visible_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          profile_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          role?: Database["public"]["Enums"]["role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role"]
          },
        ]
      }
      user_tenant_roles: {
        Row: {
          role: Database["public"]["Enums"]["role_type_test"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["role_type_test"]
          tenant_id: string
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["role_type_test"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenant_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      test_booking_with_user_and_location: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_code: string | null
          email: string | null
          final_amount: number | null
          full_name: string | null
          id: string | null
          notes: string | null
          order_number: string | null
          payment_details: Json | null
          payment_status: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      clear_request_user_id: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_request_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_only: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_elevated_core: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_super_vera: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_request_user_id: {
        Args: { user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      role_type: "User" | "Admin" | "SuperVera"
      role_type_test: "super_user" | "manager" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      role_type: ["User", "Admin", "SuperVera"],
      role_type_test: ["super_user", "manager", "user"],
    },
  },
} as const

