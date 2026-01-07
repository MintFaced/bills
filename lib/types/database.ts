export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          business_name: string | null
          staff_count: number | null
          created_at: string
          updated_at: string
          last_seen_at: string | null
        }
        Insert: {
          id: string
          email: string
          business_name?: string | null
          staff_count?: number | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          business_name?: string | null
          staff_count?: number | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
      }
      sprints: {
        Row: {
          id: string
          user_id: string
          sprint_id: string
          status: string
          primary_category: string
          marketing_tools: string[] | null
          payment_frequency: string | null
          retention_priority: boolean | null
          aggressiveness: string | null
          include_it_mobile: boolean | null
          has_microsoft365: boolean | null
          has_google_workspace: boolean | null
          has_cloud_storage: boolean | null
          deposit_amount: number
          deposit_paid: boolean | null
          deposit_paid_at: string | null
          linkedin_discount: boolean | null
          linkedin_post_url: string | null
          potential_savings_annual: number | null
          confirmed_savings_day31: number | null
          confirmed_savings_day90: number | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          final_fee_charged: number | null
          created_at: string
          updated_at: string
          day31_checkpoint_at: string | null
          day90_checkpoint_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          sprint_id: string
          status?: string
          primary_category?: string
          marketing_tools?: string[] | null
          payment_frequency?: string | null
          retention_priority?: boolean | null
          aggressiveness?: string | null
          include_it_mobile?: boolean | null
          has_microsoft365?: boolean | null
          has_google_workspace?: boolean | null
          has_cloud_storage?: boolean | null
          deposit_amount: number
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          linkedin_discount?: boolean | null
          linkedin_post_url?: string | null
          potential_savings_annual?: number | null
          confirmed_savings_day31?: number | null
          confirmed_savings_day90?: number | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          final_fee_charged?: number | null
          created_at?: string
          updated_at?: string
          day31_checkpoint_at?: string | null
          day90_checkpoint_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          sprint_id?: string
          status?: string
          primary_category?: string
          marketing_tools?: string[] | null
          payment_frequency?: string | null
          retention_priority?: boolean | null
          aggressiveness?: string | null
          include_it_mobile?: boolean | null
          has_microsoft365?: boolean | null
          has_google_workspace?: boolean | null
          has_cloud_storage?: boolean | null
          deposit_amount?: number
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          linkedin_discount?: boolean | null
          linkedin_post_url?: string | null
          potential_savings_annual?: number | null
          confirmed_savings_day31?: number | null
          confirmed_savings_day90?: number | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          final_fee_charged?: number | null
          created_at?: string
          updated_at?: string
          day31_checkpoint_at?: string | null
          day90_checkpoint_at?: string | null
          completed_at?: string | null
        }
      }
      uploads: {
        Row: {
          id: string
          sprint_id: string
          user_id: string
          file_name: string
          file_size: number
          file_path: string
          bank_name: string | null
          upload_type: string
          processed: boolean | null
          processed_at: string | null
          transaction_count: number | null
          column_mapping: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          user_id: string
          file_name: string
          file_size: number
          file_path: string
          bank_name?: string | null
          upload_type: string
          processed?: boolean | null
          processed_at?: string | null
          transaction_count?: number | null
          column_mapping?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          user_id?: string
          file_name?: string
          file_size?: number
          file_path?: string
          bank_name?: string | null
          upload_type?: string
          processed?: boolean | null
          processed_at?: string | null
          transaction_count?: number | null
          column_mapping?: Json | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          upload_id: string
          sprint_id: string
          transaction_date: string
          raw_description: string
          normalized_description: string
          amount: number
          transaction_type: string | null
          balance: number | null
          merchant_candidate: string | null
          created_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          sprint_id: string
          transaction_date: string
          raw_description: string
          normalized_description: string
          amount: number
          transaction_type?: string | null
          balance?: number | null
          merchant_candidate?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          upload_id?: string
          sprint_id?: string
          transaction_date?: string
          raw_description?: string
          normalized_description?: string
          amount?: number
          transaction_type?: string | null
          balance?: number | null
          merchant_candidate?: string | null
          created_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          aliases: string[] | null
          category: string | null
          known_saas: boolean | null
          typical_frequency: string | null
          supports_annual_discount: boolean | null
          retention_discount_likely: boolean | null
          bundle_includes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          aliases?: string[] | null
          category?: string | null
          known_saas?: boolean | null
          typical_frequency?: string | null
          supports_annual_discount?: boolean | null
          retention_discount_likely?: boolean | null
          bundle_includes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          aliases?: string[] | null
          category?: string | null
          known_saas?: boolean | null
          typical_frequency?: string | null
          supports_annual_discount?: boolean | null
          retention_discount_likely?: boolean | null
          bundle_includes?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_charges: {
        Row: {
          id: string
          sprint_id: string
          vendor_id: string | null
          merchant_candidate: string
          raw_descriptions: string[] | null
          transaction_ids: string[] | null
          frequency_type: string | null
          frequency_days: number | null
          baseline_monthly_cost: number | null
          last_charge_date: string | null
          charge_count: number | null
          confidence_score: number | null
          category: string | null
          user_confirmed_category: string | null
          priority: string | null
          is_duplicate: boolean | null
          duplicate_of: string | null
          monthly_to_annual_eligible: boolean | null
          retention_discount_eligible: boolean | null
          potential_savings_annual: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          vendor_id?: string | null
          merchant_candidate: string
          raw_descriptions?: string[] | null
          transaction_ids?: string[] | null
          frequency_type?: string | null
          frequency_days?: number | null
          baseline_monthly_cost?: number | null
          last_charge_date?: string | null
          charge_count?: number | null
          confidence_score?: number | null
          category?: string | null
          user_confirmed_category?: string | null
          priority?: string | null
          is_duplicate?: boolean | null
          duplicate_of?: string | null
          monthly_to_annual_eligible?: boolean | null
          retention_discount_eligible?: boolean | null
          potential_savings_annual?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          vendor_id?: string | null
          merchant_candidate?: string
          raw_descriptions?: string[] | null
          transaction_ids?: string[] | null
          frequency_type?: string | null
          frequency_days?: number | null
          baseline_monthly_cost?: number | null
          last_charge_date?: string | null
          charge_count?: number | null
          confidence_score?: number | null
          category?: string | null
          user_confirmed_category?: string | null
          priority?: string | null
          is_duplicate?: boolean | null
          duplicate_of?: string | null
          monthly_to_annual_eligible?: boolean | null
          retention_discount_eligible?: boolean | null
          potential_savings_annual?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      actions: {
        Row: {
          id: string
          sprint_id: string
          vendor_charge_id: string
          action_type: string
          recommended: boolean | null
          priority: number | null
          potential_savings_annual: number | null
          user_viewed: boolean | null
          user_started: boolean | null
          user_completed: boolean | null
          outcome: string | null
          new_price: number | null
          notes: string | null
          script_email: string | null
          script_chat: string | null
          script_call: string | null
          cancel_steps: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          sprint_id: string
          vendor_charge_id: string
          action_type: string
          recommended?: boolean | null
          priority?: number | null
          potential_savings_annual?: number | null
          user_viewed?: boolean | null
          user_started?: boolean | null
          user_completed?: boolean | null
          outcome?: string | null
          new_price?: number | null
          notes?: string | null
          script_email?: string | null
          script_chat?: string | null
          script_call?: string | null
          cancel_steps?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          sprint_id?: string
          vendor_charge_id?: string
          action_type?: string
          recommended?: boolean | null
          priority?: number | null
          potential_savings_annual?: number | null
          user_viewed?: boolean | null
          user_started?: boolean | null
          user_completed?: boolean | null
          outcome?: string | null
          new_price?: number | null
          notes?: string | null
          script_email?: string | null
          script_chat?: string | null
          script_call?: string | null
          cancel_steps?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      checkpoints: {
        Row: {
          id: string
          sprint_id: string
          upload_id: string | null
          checkpoint_type: string
          due_date: string
          completed: boolean | null
          completed_at: string | null
          confirmed_savings: number | null
          vendors_cancelled: number | null
          vendors_negotiated: number | null
          vendors_pending: number | null
          reminder_sent_on_due: boolean | null
          reminder_sent_plus2: boolean | null
          reminder_sent_plus4: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          upload_id?: string | null
          checkpoint_type: string
          due_date: string
          completed?: boolean | null
          completed_at?: string | null
          confirmed_savings?: number | null
          vendors_cancelled?: number | null
          vendors_negotiated?: number | null
          vendors_pending?: number | null
          reminder_sent_on_due?: boolean | null
          reminder_sent_plus2?: boolean | null
          reminder_sent_plus4?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          upload_id?: string | null
          checkpoint_type?: string
          due_date?: string
          completed?: boolean | null
          completed_at?: string | null
          confirmed_savings?: number | null
          vendors_cancelled?: number | null
          vendors_negotiated?: number | null
          vendors_pending?: number | null
          reminder_sent_on_due?: boolean | null
          reminder_sent_plus2?: boolean | null
          reminder_sent_plus4?: boolean | null
          created_at?: string
        }
      }
      billing_events: {
        Row: {
          id: string
          sprint_id: string
          user_id: string
          event_type: string
          amount: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_charge_id: string | null
          description: string | null
          metadata: Json | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          sprint_id: string
          user_id: string
          event_type: string
          amount: number
          status: string
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_charge_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          sprint_id?: string
          user_id?: string
          event_type?: string
          amount?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_charge_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
          processed_at?: string | null
        }
      }
      share_posts: {
        Row: {
          id: string
          sprint_id: string
          user_id: string
          linkedin_post_url: string
          verified: boolean | null
          discount_applied: boolean | null
          potential_savings: number | null
          subscriptions_found: number | null
          duplicates_flagged: number | null
          monthly_to_annual_wins: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sprint_id: string
          user_id: string
          linkedin_post_url: string
          verified?: boolean | null
          discount_applied?: boolean | null
          potential_savings?: number | null
          subscriptions_found?: number | null
          duplicates_flagged?: number | null
          monthly_to_annual_wins?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          sprint_id?: string
          user_id?: string
          linkedin_post_url?: string
          verified?: boolean | null
          discount_applied?: boolean | null
          potential_savings?: number | null
          subscriptions_found?: number | null
          duplicates_flagged?: number | null
          monthly_to_annual_wins?: number | null
          created_at?: string
        }
      }
      leaderboard_aggregates: {
        Row: {
          id: string
          period_type: string
          period_start: string
          period_end: string
          participant_count: number | null
          total_potential_savings: number | null
          median_potential_savings: number | null
          total_confirmed_savings: number | null
          median_confirmed_savings: number | null
          top_category_1: string | null
          top_category_1_count: number | null
          top_category_2: string | null
          top_category_2_count: number | null
          top_category_3: string | null
          top_category_3_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_type: string
          period_start: string
          period_end: string
          participant_count?: number | null
          total_potential_savings?: number | null
          median_potential_savings?: number | null
          total_confirmed_savings?: number | null
          median_confirmed_savings?: number | null
          top_category_1?: string | null
          top_category_1_count?: number | null
          top_category_2?: string | null
          top_category_2_count?: number | null
          top_category_3?: string | null
          top_category_3_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_type?: string
          period_start?: string
          period_end?: string
          participant_count?: number | null
          total_potential_savings?: number | null
          median_potential_savings?: number | null
          total_confirmed_savings?: number | null
          median_confirmed_savings?: number | null
          top_category_1?: string | null
          top_category_1_count?: number | null
          top_category_2?: string | null
          top_category_2_count?: number | null
          top_category_3?: string | null
          top_category_3_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      deletion_requests: {
        Row: {
          id: string
          user_id: string
          requested_at: string
          completed_at: string | null
          status: string
          sprints_deleted: number | null
          uploads_deleted: number | null
          transactions_deleted: number | null
        }
        Insert: {
          id?: string
          user_id: string
          requested_at?: string
          completed_at?: string | null
          status?: string
          sprints_deleted?: number | null
          uploads_deleted?: number | null
          transactions_deleted?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          requested_at?: string
          completed_at?: string | null
          status?: string
          sprints_deleted?: number | null
          uploads_deleted?: number | null
          transactions_deleted?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
