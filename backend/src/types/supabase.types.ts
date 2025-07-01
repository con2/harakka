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
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          provider_organization_id: string | null
          quantity: number
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
          provider_organization_id?: string | null
          quantity?: number
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
          provider_organization_id?: string | null
          quantity?: number
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
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
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
            foreignKeyName: "order_items_provider_organization_id_fkey"
            columns: ["provider_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      organization_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          owned_quantity: number
          storage_item_id: string
          storage_location_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          owned_quantity?: number
          storage_item_id: string
          storage_location_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          owned_quantity?: number
          storage_item_id?: string
          storage_location_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erm_organization_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_organization_items_storage_item_id_fkey"
            columns: ["storage_item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_organization_items_storage_item_id_fkey"
            columns: ["storage_item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "erm_organization_items_storage_item_id_fkey"
            columns: ["storage_item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "organization_items_storage_location_id_fkey"
            columns: ["storage_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
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
          name?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
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
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
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
            foreignKeyName: "saved_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "saved_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
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
          test_metadata: Json | null
          test_priority_score: number | null
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
          test_metadata?: Json | null
          test_priority_score?: number | null
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
          test_metadata?: Json | null
          test_priority_score?: number | null
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
        ]
      }
    }
    Views: {
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
    }
    Functions: {
      calculate_storage_item_total: {
        Args: { item_id: string }
        Returns: number
      }
      calculate_test_metrics: {
        Args: { item_id: string }
        Returns: Json
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_all_full_orders: {
        Args: { in_offset?: number; in_limit?: number }
        Returns: Json
      }
      get_full_order: {
        Args: { order_id: string }
        Returns: Json
      }
      get_full_user_order: {
        Args: { in_user_id: string; in_offset?: number; in_limit?: number }
        Returns: Json
      }
      get_request_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_highest_tenant_role: {
        Args: { p_user_id: string; p_tenant_id: string }
        Returns: Database["public"]["Enums"]["tenant_role"]
      }
      get_user_tenant_roles: {
        Args: { p_user_id: string; p_tenant_id: string }
        Returns: {
          role_name: Database["public"]["Enums"]["tenant_role"]
          granted_at: string
        }[]
      }
      has_tenant_admin_role: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      is_tenant_admin: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      user_has_tenant_role: {
        Args: {
          p_user_id: string
          p_tenant_id: string
          p_role: Database["public"]["Enums"]["tenant_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
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
      tenant_role: "admin" | "manager" | "user" | "viewer" | "editor"
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
      ],
      tenant_role: ["admin", "manager", "user", "viewer", "editor"],
    },
  },
} as const

