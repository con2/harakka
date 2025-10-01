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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      booking_items: {
        Row: {
          booking_id: string
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          location_id: string
          provider_organization_id: string
          quantity: number
          self_pickup: boolean
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_days: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          location_id: string
          provider_organization_id: string
          quantity?: number
          self_pickup?: boolean
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_days: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          location_id?: string
          provider_organization_id?: string
          quantity?: number
          self_pickup?: boolean
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
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
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_today"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_overdue"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_provider_organization_id_fkey"
            columns: ["provider_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booked_by_org: string | null
          booking_number: string
          created_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booked_by_org?: string | null
          booking_number: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booked_by_org?: string | null
          booking_number?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          parent_id: string | null
          sort_order: number | null
          translations: Json
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          parent_id?: string | null
          sort_order?: number | null
          translations: Json
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          parent_id?: string | null
          sort_order?: number | null
          translations?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "view_category_details"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivered_at: string | null
          id: string
          idempotency_key: string
          message: string | null
          metadata: Json | null
          read_at: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_status"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_today"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_overdue"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_locations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          storage_location_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          storage_location_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          storage_location_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erm_organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_organization_locations_storage_location_id_fkey"
            columns: ["storage_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          logo_picture_url: string | null
          name: string
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          logo_picture_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          logo_picture_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
          owner_organization_id: string | null
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
          owner_organization_id?: string | null
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
          owner_organization_id?: string | null
          starts_at?: string
          times_used?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_owner_organization_id_fkey"
            columns: ["owner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          booking_id: string
          claimed_at: string | null
          created_at: string
          error: string | null
          id: string
          recipient_email: string
          reminder_date: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          booking_id: string
          claimed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          recipient_email: string
          reminder_date: string
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          booking_id?: string
          claimed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          recipient_email?: string
          reminder_date?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_status"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_today"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_overdue"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["roles_type"]
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["roles_type"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["roles_type"]
        }
        Relationships: []
      }
      storage_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          location_id: string
          occupancy_rate: number | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          location_id: string
          occupancy_rate?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          location_id?: string
          occupancy_rate?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_analytics_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
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
          object_fit: Database["public"]["Enums"]["object_fit"]
          storage_path: string
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
          object_fit?: Database["public"]["Enums"]["object_fit"]
          storage_path: string
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
          object_fit?: Database["public"]["Enums"]["object_fit"]
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
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
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "view_tag_popularity"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_items: {
        Row: {
          available_quantity: number | null
          average_rating: number | null
          category_id: string | null
          compartment_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          location_id: string
          org_id: string
          quantity: number
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number | null
          average_rating?: number | null
          category_id?: string | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          location_id: string
          org_id: string
          quantity: number
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number | null
          average_rating?: number | null
          category_id?: string | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          location_id?: string
          org_id?: string
          quantity?: number
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_details"
            referencedColumns: ["id"]
          },
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          test_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          test_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          test_data?: Json | null
          updated_at?: string | null
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
      user_ban_history: {
        Row: {
          action: string
          affected_assignments: Json | null
          ban_reason: string | null
          ban_type: string
          banned_at: string | null
          banned_by: string
          created_at: string | null
          id: string
          is_permanent: boolean | null
          notes: string | null
          organization_id: string | null
          role_assignment_id: string | null
          unbanned_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          affected_assignments?: Json | null
          ban_reason?: string | null
          ban_type: string
          banned_at?: string | null
          banned_by: string
          created_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          organization_id?: string | null
          role_assignment_id?: string | null
          unbanned_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          affected_assignments?: Json | null
          ban_reason?: string | null
          ban_type?: string
          banned_at?: string | null
          banned_by?: string
          created_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          organization_id?: string | null
          role_assignment_id?: string | null
          unbanned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_status"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_today"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_bookings_overdue"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_role_assignment_id_fkey"
            columns: ["role_assignment_id"]
            isOneToOne: false
            referencedRelation: "user_organization_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_role_assignment_id_fkey"
            columns: ["role_assignment_id"]
            isOneToOne: false
            referencedRelation: "view_user_roles_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_status"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_due_today"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_overdue"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organization_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          role_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          role_id: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          role_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erm_user_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_user_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_picture_url: string | null
          visible_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_picture_url?: string | null
          visible_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_picture_url?: string | null
          visible_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown | null
          fk_schema_name: unknown | null
          fk_table_name: unknown | null
          fk_table_oid: unknown | null
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown | null
          pk_index_name: unknown | null
          pk_schema_name: unknown | null
          pk_table_name: unknown | null
          pk_table_oid: unknown | null
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown | null
          langoid: unknown | null
          name: unknown | null
          oid: unknown | null
          owner: unknown | null
          returns: string | null
          returns_set: boolean | null
          schema: unknown | null
          volatility: string | null
        }
        Relationships: []
      }
      view_bookings_due_status: {
        Row: {
          booking_id: string | null
          booking_number: string | null
          days_overdue: number | null
          due_status: string | null
          earliest_due_date: string | null
          full_name: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_bookings_due_today: {
        Row: {
          booking_id: string | null
          booking_number: string | null
          days_overdue: number | null
          due_status: string | null
          earliest_due_date: string | null
          full_name: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_bookings_overdue: {
        Row: {
          booking_id: string | null
          booking_number: string | null
          days_overdue: number | null
          due_status: string | null
          earliest_due_date: string | null
          full_name: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_bookings_with_details: {
        Row: {
          booking_items: Json | null
          booking_number: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_bookings_with_user_info: {
        Row: {
          booked_by_org: string | null
          booking_number: string | null
          created_at: string | null
          created_at_text: string | null
          email: string | null
          full_name: string | null
          id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          user_id: string | null
          visible_name: string | null
        }
        Relationships: []
      }
      view_category_details: {
        Row: {
          assigned_to: number | null
          created_at: string | null
          id: string | null
          parent_id: string | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "view_category_details"
            referencedColumns: ["id"]
          },
        ]
      }
      view_item_location_summary: {
        Row: {
          item_name: string | null
          location_name: string | null
          organization_breakdown: string | null
          organizations_count: number | null
          storage_item_id: string | null
          total_at_location: number | null
        }
        Relationships: []
      }
      view_item_ownership_summary: {
        Row: {
          item_name: string | null
          location_name: string | null
          location_total: number | null
          organization_name: string | null
          owned_quantity: number | null
          storage_item_id: string | null
          total_across_all_locations: number | null
        }
        Relationships: []
      }
      view_manage_storage_items: {
        Row: {
          available_quantity: number | null
          category_en_name: string | null
          category_fi_name: string | null
          category_id: string | null
          created_at: string | null
          en_item_name: string | null
          en_item_type: string | null
          fi_item_name: string | null
          fi_item_type: string | null
          id: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          location_id: string | null
          location_name: string | null
          organization_id: string | null
          quantity: number | null
          tag_ids: string[] | null
          tag_translations: Json[] | null
          translations: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_details"
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
      view_tag_popularity: {
        Row: {
          assigned_to: number | null
          created_at: string | null
          id: string | null
          popularity_rank: string | null
          rank_percentile: number | null
          tag_name: string | null
          total_bookings: number | null
          translations: Json | null
        }
        Relationships: []
      }
      view_user_ban_status: {
        Row: {
          active_roles_count: number | null
          ban_reason: string | null
          ban_status: string | null
          banned_at: string | null
          banned_by: string | null
          banned_by_email: string | null
          banned_by_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          inactive_roles_count: number | null
          is_permanent: boolean | null
          latest_action: string | null
          latest_ban_type: string | null
          unbanned_at: string | null
          user_created_at: string | null
          visible_name: string | null
        }
        Relationships: []
      }
      view_user_roles_with_details: {
        Row: {
          assigned_at: string | null
          assignment_updated_at: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          organization_is_active: boolean | null
          organization_name: string | null
          role_id: string | null
          role_name: Database["public"]["Enums"]["roles_type"] | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
          user_phone: string | null
          user_visible_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erm_user_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_user_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _cleanup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _contract_on: {
        Args: { "": string }
        Returns: unknown
      }
      _currtest: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      _db_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _definer: {
        Args: { "": unknown }
        Returns: boolean
      }
      _dexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _expand_context: {
        Args: { "": string }
        Returns: string
      }
      _expand_on: {
        Args: { "": string }
        Returns: string
      }
      _expand_vol: {
        Args: { "": string }
        Returns: string
      }
      _ext_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _extensions: {
        Args: Record<PropertyKey, never> | { "": unknown }
        Returns: unknown[]
      }
      _funkargs: {
        Args: { "": unknown[] }
        Returns: string
      }
      _get: {
        Args: { "": string }
        Returns: number
      }
      _get_db_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_dtype: {
        Args: { "": unknown }
        Returns: string
      }
      _get_language_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_latest: {
        Args: { "": string }
        Returns: number[]
      }
      _get_note: {
        Args: { "": number } | { "": string }
        Returns: string
      }
      _get_opclass_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_rel_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_schema_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_tablespace_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_type_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _got_func: {
        Args: { "": unknown }
        Returns: boolean
      }
      _grolist: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _has_group: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_role: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_user: {
        Args: { "": unknown }
        Returns: boolean
      }
      _inherited: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_schema: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_super: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_trusted: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_verbose: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _lang: {
        Args: { "": unknown }
        Returns: unknown
      }
      _opc_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _parts: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _pg_sv_type_array: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      _prokind: {
        Args: { p_oid: unknown }
        Returns: unknown
      }
      _query: {
        Args: { "": string }
        Returns: string
      }
      _refine_vol: {
        Args: { "": string }
        Returns: string
      }
      _relexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _returns: {
        Args: { "": unknown }
        Returns: string
      }
      _strict: {
        Args: { "": unknown }
        Returns: boolean
      }
      _table_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _temptypes: {
        Args: { "": string }
        Returns: string
      }
      _todo: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _vol: {
        Args: { "": unknown }
        Returns: string
      }
      availability_overview: {
        Args: {
          category_ids?: string[]
          end_ts?: string
          item_ids?: string[]
          location_ids?: string[]
          org_uuid: string
          start_ts?: string
        }
        Returns: {
          already_booked_quantity: number
          available_quantity: number
          item_id: string
          total_quantity: number
        }[]
      }
      calculate_storage_item_total: {
        Args: { item_id: string }
        Returns: number
      }
      can: {
        Args: { "": unknown[] }
        Returns: string
      }
      casts_are: {
        Args: { "": string[] }
        Returns: string
      }
      cleanup_item_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      col_is_null: {
        Args:
          | {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
          | { column_name: unknown; description?: string; table_name: unknown }
        Returns: string
      }
      col_not_null: {
        Args:
          | {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
          | { column_name: unknown; description?: string; table_name: unknown }
        Returns: string
      }
      collect_tap: {
        Args: Record<PropertyKey, never> | { "": string[] }
        Returns: string
      }
      create_notification: {
        Args: {
          p_channel?: Database["public"]["Enums"]["notification_channel"]
          p_idempotency_key?: string
          p_message?: string
          p_metadata?: Json
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      diag: {
        Args:
          | Record<PropertyKey, never>
          | Record<PropertyKey, never>
          | { msg: string }
          | { msg: unknown }
        Returns: string
      }
      diag_test_name: {
        Args: { "": string }
        Returns: string
      }
      do_tap: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      domains_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      enums_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      extensions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      fail: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      findfuncs: {
        Args: { "": string }
        Returns: string[]
      }
      finish: {
        Args: { exception_on_failure?: boolean }
        Returns: string[]
      }
      foreign_tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      functions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_all_full_bookings: {
        Args: { in_limit: number; in_offset: number }
        Returns: Json
      }
      get_all_full_orders: {
        Args: { in_limit?: number; in_offset?: number }
        Returns: Json
      }
      get_category_descendants: {
        Args: { category_uuid: string }
        Returns: {
          id: string
        }[]
      }
      get_full_booking: {
        Args: { booking_id: string }
        Returns: Json
      }
      get_full_order: {
        Args: { order_id: string }
        Returns: Json
      }
      get_full_user_booking: {
        Args: { in_limit: number; in_offset: number; in_user_id: string }
        Returns: Json
      }
      get_full_user_order: {
        Args: { in_limit?: number; in_offset?: number; in_user_id: string }
        Returns: Json
      }
      get_latest_ban_record: {
        Args: { check_user_id: string }
        Returns: {
          action: string
          ban_reason: string
          ban_type: string
          banned_at: string
          banned_by: string
          id: string
          is_permanent: boolean
          organization_id: string
          role_assignment_id: string
          unbanned_at: string
        }[]
      }
      get_request_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_table_columns: {
        Args: { input_table_name: string }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
      get_user_roles: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          organization_name: string
          organization_slug: string
          role_id: string
          role_name: string
          user_id: string
        }[]
      }
      groups_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      has_check: {
        Args: { "": unknown }
        Returns: string
      }
      has_composite: {
        Args: { "": unknown }
        Returns: string
      }
      has_domain: {
        Args: { "": unknown }
        Returns: string
      }
      has_enum: {
        Args: { "": unknown }
        Returns: string
      }
      has_extension: {
        Args: { "": unknown }
        Returns: string
      }
      has_fk: {
        Args: { "": unknown }
        Returns: string
      }
      has_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_function: {
        Args: { "": unknown }
        Returns: string
      }
      has_group: {
        Args: { "": unknown }
        Returns: string
      }
      has_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      has_language: {
        Args: { "": unknown }
        Returns: string
      }
      has_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      has_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      has_pk: {
        Args: { "": unknown }
        Returns: string
      }
      has_relation: {
        Args: { "": unknown }
        Returns: string
      }
      has_role: {
        Args: { "": unknown }
        Returns: string
      }
      has_schema: {
        Args: { "": unknown }
        Returns: string
      }
      has_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      has_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      has_type: {
        Args: { "": unknown }
        Returns: string
      }
      has_unique: {
        Args: { "": string }
        Returns: string
      }
      has_user: {
        Args: { "": unknown }
        Returns: string
      }
      has_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_composite: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_domain: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_enum: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_extension: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_fk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_function: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_group: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_language: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_pk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_relation: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_role: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_schema: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_type: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_user: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_view: {
        Args: { "": unknown }
        Returns: string
      }
      in_todo: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      index_is_primary: {
        Args: { "": unknown }
        Returns: string
      }
      index_is_unique: {
        Args: { "": unknown }
        Returns: string
      }
      is_admin: {
        Args: { p_org_id?: string; p_user_id: string }
        Returns: boolean
      }
      is_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      is_clustered: {
        Args: { "": unknown }
        Returns: string
      }
      is_definer: {
        Args: { "": unknown }
        Returns: string
      }
      is_empty: {
        Args: { "": string }
        Returns: string
      }
      is_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      is_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      is_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      is_strict: {
        Args: { "": unknown }
        Returns: string
      }
      is_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      is_user_banned_for_app: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_banned_for_org: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
      is_user_banned_for_role: {
        Args: {
          check_org_id: string
          check_role_id: string
          check_user_id: string
        }
        Returns: boolean
      }
      is_window: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_definer: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_empty: {
        Args: { "": string }
        Returns: string
      }
      isnt_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_strict: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_window: {
        Args: { "": unknown }
        Returns: string
      }
      language_is_trusted: {
        Args: { "": unknown }
        Returns: string
      }
      languages_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      lives_ok: {
        Args: { "": string }
        Returns: string
      }
      materialized_views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      no_plan: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      notify: {
        Args: {
          p_channel?: Database["public"]["Enums"]["notification_channel"]
          p_message?: string
          p_metadata?: Json
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_title?: string
          p_type_txt: string
          p_user_id: string
        }
        Returns: undefined
      }
      num_failed: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ok: {
        Args: { "": boolean }
        Returns: string
      }
      opclasses_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      operators_are: {
        Args: { "": string[] }
        Returns: string
      }
      os_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pass: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      pg_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pg_version_num: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      pgtap_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      plan: {
        Args: { "": number }
        Returns: string
      }
      roles_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      runtests: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      schemas_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      sequences_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      skip: {
        Args:
          | { "": number }
          | { "": string }
          | { how_many: number; why: string }
        Returns: string
      }
      tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      tablespaces_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      throws_ok: {
        Args: { "": string }
        Returns: string
      }
      todo: {
        Args:
          | { how_many: number }
          | { how_many: number; why: string }
          | { how_many: number; why: string }
          | { why: string }
        Returns: boolean[]
      }
      todo_end: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      todo_start: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: boolean[]
      }
      types_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      users_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "cancelled"
        | "picked_up"
        | "returned"
        | "completed"
      notification_channel: "in_app" | "web_push" | "email"
      notification_severity: "info" | "warning" | "critical"
      notification_type:
        | "comment"
        | "mention"
        | "system"
        | "custom"
        | "booking.status_approved"
        | "booking.status_rejected"
        | "booking.created"
        | "user.created"
      object_fit: "cover" | "contain"
      role_type:
        | "User"
        | "Admin"
        | "SuperVera"
        | "app_admin"
        | "main_admin"
        | "admin"
        | "user"
        | "superVera"
      roles_type:
        | "super_admin"
        | "main_admin"
        | "admin"
        | "user"
        | "superVera"
        | "storage_manager"
        | "requester"
        | "tenant_admin"
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "picked_up",
        "returned",
        "completed",
      ],
      notification_channel: ["in_app", "web_push", "email"],
      notification_severity: ["info", "warning", "critical"],
      notification_type: [
        "comment",
        "mention",
        "system",
        "custom",
        "booking.status_approved",
        "booking.status_rejected",
        "booking.created",
        "user.created",
      ],
      object_fit: ["cover", "contain"],
      role_type: [
        "User",
        "Admin",
        "SuperVera",
        "app_admin",
        "main_admin",
        "admin",
        "user",
        "superVera",
      ],
      roles_type: [
        "super_admin",
        "main_admin",
        "admin",
        "user",
        "superVera",
        "storage_manager",
        "requester",
        "tenant_admin",
      ],
    },
  },
} as const

