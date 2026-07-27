export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      deleted_users_archive: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          deleted_by_name: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          original_user_id: string
          phone: string | null
          reason: string | null
          role: string | null
          was_active: boolean | null
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          deleted_by_name?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          original_user_id: string
          phone?: string | null
          reason?: string | null
          role?: string | null
          was_active?: boolean | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          deleted_by_name?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          original_user_id?: string
          phone?: string | null
          reason?: string | null
          role?: string | null
          was_active?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      procurement_feedback: {
        Row: {
          created_at: string
          feedback_notes: string | null
          id: string
          site_id: string
          status: Database["public"]["Enums"]["feedback_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_notes?: string | null
          id?: string
          site_id: string
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_notes?: string | null
          id?: string
          site_id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_feedback_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_submissions: {
        Row: {
          acquisition_approved: boolean
          acquisition_approved_file_url: string | null
          actual_delivery_date: string | null
          contact_person: string | null
          created_at: string
          delivery_note_doc_url: string | null
          email_address: string | null
          expected_delivery_date: string | null
          grn_doc_url: string | null
          handover_to_vendor: boolean
          handover_to_vendor_file_url: string | null
          id: string
          invoice_number: string | null
          land_identified: boolean
          land_identified_file_url: string | null
          lease_negotiation: boolean
          lease_negotiation_file_url: string | null
          lease_registration: boolean
          lease_registration_file_url: string | null
          lease_signed: boolean
          lease_signed_file_url: string | null
          material_delivery_status: string | null
          material_handover_form_doc_url: string | null
          material_inspection_report_doc_url: string | null
          notes: string | null
          ownership_verified: boolean
          ownership_verified_file_url: string | null
          payment_status: string | null
          phone_number: string | null
          po_date: string | null
          po_number: string | null
          po_status: string | null
          procurement_status: string | null
          purchase_order_doc_url: string | null
          review_notes: string | null
          reviewed_by: string | null
          road_access: boolean
          road_access_file_url: string | null
          site_handover: boolean
          site_handover_file_url: string | null
          site_id: string
          status: Database["public"]["Enums"]["site_status"]
          submitted_by: string | null
          supplier_company: string | null
          updated_at: string
          vendor_contract: boolean
          vendor_contract_file_url: string | null
          vendor_delivery_cert_doc_url: string | null
          vendor_name: string | null
        }
        Insert: {
          acquisition_approved?: boolean
          acquisition_approved_file_url?: string | null
          actual_delivery_date?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_note_doc_url?: string | null
          email_address?: string | null
          expected_delivery_date?: string | null
          grn_doc_url?: string | null
          handover_to_vendor?: boolean
          handover_to_vendor_file_url?: string | null
          id?: string
          invoice_number?: string | null
          land_identified?: boolean
          land_identified_file_url?: string | null
          lease_negotiation?: boolean
          lease_negotiation_file_url?: string | null
          lease_registration?: boolean
          lease_registration_file_url?: string | null
          lease_signed?: boolean
          lease_signed_file_url?: string | null
          material_delivery_status?: string | null
          material_handover_form_doc_url?: string | null
          material_inspection_report_doc_url?: string | null
          notes?: string | null
          ownership_verified?: boolean
          ownership_verified_file_url?: string | null
          payment_status?: string | null
          phone_number?: string | null
          po_date?: string | null
          po_number?: string | null
          po_status?: string | null
          procurement_status?: string | null
          purchase_order_doc_url?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          road_access?: boolean
          road_access_file_url?: string | null
          site_handover?: boolean
          site_handover_file_url?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["site_status"]
          submitted_by?: string | null
          supplier_company?: string | null
          updated_at?: string
          vendor_contract?: boolean
          vendor_contract_file_url?: string | null
          vendor_delivery_cert_doc_url?: string | null
          vendor_name?: string | null
        }
        Update: {
          acquisition_approved?: boolean
          acquisition_approved_file_url?: string | null
          actual_delivery_date?: string | null
          contact_person?: string | null
          created_at?: string
          delivery_note_doc_url?: string | null
          email_address?: string | null
          expected_delivery_date?: string | null
          grn_doc_url?: string | null
          handover_to_vendor?: boolean
          handover_to_vendor_file_url?: string | null
          id?: string
          invoice_number?: string | null
          land_identified?: boolean
          land_identified_file_url?: string | null
          lease_negotiation?: boolean
          lease_negotiation_file_url?: string | null
          lease_registration?: boolean
          lease_registration_file_url?: string | null
          lease_signed?: boolean
          lease_signed_file_url?: string | null
          material_delivery_status?: string | null
          material_handover_form_doc_url?: string | null
          material_inspection_report_doc_url?: string | null
          notes?: string | null
          ownership_verified?: boolean
          ownership_verified_file_url?: string | null
          payment_status?: string | null
          phone_number?: string | null
          po_date?: string | null
          po_number?: string | null
          po_status?: string | null
          procurement_status?: string | null
          purchase_order_doc_url?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          road_access?: boolean
          road_access_file_url?: string | null
          site_handover?: boolean
          site_handover_file_url?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["site_status"]
          submitted_by?: string | null
          supplier_company?: string | null
          updated_at?: string
          vendor_contract?: boolean
          vendor_contract_file_url?: string | null
          vendor_delivery_cert_doc_url?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          arguments: Json | null
          caller_role: string | null
          caller_user_id: string | null
          error_code: string | null
          error_message: string | null
          function_name: string
          id: string
          occurred_at: string
          severity: string
        }
        Insert: {
          arguments?: Json | null
          caller_role?: string | null
          caller_user_id?: string | null
          error_code?: string | null
          error_message?: string | null
          function_name: string
          id?: string
          occurred_at?: string
          severity?: string
        }
        Update: {
          arguments?: Json | null
          caller_role?: string | null
          caller_user_id?: string | null
          error_code?: string | null
          error_message?: string | null
          function_name?: string
          id?: string
          occurred_at?: string
          severity?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          access_road_condition: string | null
          address: string | null
          antenna_type: string | null
          approval_date: string | null
          approval_letter_url: string | null
          backup_power: string | null
          battery_bank_type: string | null
          cast_status: string | null
          civil_rfi: string | null
          contractor_name: string | null
          created_at: string
          current_phase: string | null
          dimensions: string | null
          distance_nearest_bts: number | null
          district: string
          earthing_resistance: number | null
          elevation: number | null
          equipment_shelter: string | null
          estimated_cost: number | null
          final_approval_by: string | null
          foundation_depth: number | null
          generator_capacity: number | null
          grid_transformer_capacity: string | null
          handover_to_vendor: string | null
          id: string
          last_inspection_date: string | null
          latitude: number | null
          layout_plan_url: string | null
          longitude: number | null
          notes: string | null
          number_of_antennas: number | null
          number_of_battery_banks: number | null
          on_air: string | null
          planned_start_date: string | null
          planning_approval_status: string | null
          power_backup_type: string | null
          power_certificate_url: string | null
          power_requirement: string | null
          power_rfi: string | null
          power_rfi_status: string | null
          power_source: string | null
          progress_percent: number | null
          project_name: string | null
          project_review_status: string | null
          region: string
          review_notes: string | null
          reviewed_by: string | null
          scope: string | null
          site_configuration: string | null
          site_id_code: string
          site_implementation_design: string | null
          site_name: string
          site_photo_url: string | null
          site_type: string | null
          soil_test: string | null
          solar_capacity: number | null
          status: Database["public"]["Enums"]["site_status"]
          submitted_by: string | null
          target_completion_date: string | null
          terrain_type: string | null
          tower_height: number | null
          tower_material: string | null
          tower_rig: string | null
          tower_type: string | null
          town: string
          transmission_type: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          access_road_condition?: string | null
          address?: string | null
          antenna_type?: string | null
          approval_date?: string | null
          approval_letter_url?: string | null
          backup_power?: string | null
          battery_bank_type?: string | null
          cast_status?: string | null
          civil_rfi?: string | null
          contractor_name?: string | null
          created_at?: string
          current_phase?: string | null
          dimensions?: string | null
          distance_nearest_bts?: number | null
          district?: string
          earthing_resistance?: number | null
          elevation?: number | null
          equipment_shelter?: string | null
          estimated_cost?: number | null
          final_approval_by?: string | null
          foundation_depth?: number | null
          generator_capacity?: number | null
          grid_transformer_capacity?: string | null
          handover_to_vendor?: string | null
          id?: string
          last_inspection_date?: string | null
          latitude?: number | null
          layout_plan_url?: string | null
          longitude?: number | null
          notes?: string | null
          number_of_antennas?: number | null
          number_of_battery_banks?: number | null
          on_air?: string | null
          planned_start_date?: string | null
          planning_approval_status?: string | null
          power_backup_type?: string | null
          power_certificate_url?: string | null
          power_requirement?: string | null
          power_rfi?: string | null
          power_rfi_status?: string | null
          power_source?: string | null
          progress_percent?: number | null
          project_name?: string | null
          project_review_status?: string | null
          region?: string
          review_notes?: string | null
          reviewed_by?: string | null
          scope?: string | null
          site_configuration?: string | null
          site_id_code?: string
          site_implementation_design?: string | null
          site_name: string
          site_photo_url?: string | null
          site_type?: string | null
          soil_test?: string | null
          solar_capacity?: number | null
          status?: Database["public"]["Enums"]["site_status"]
          submitted_by?: string | null
          target_completion_date?: string | null
          terrain_type?: string | null
          tower_height?: number | null
          tower_material?: string | null
          tower_rig?: string | null
          tower_type?: string | null
          town?: string
          transmission_type?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          access_road_condition?: string | null
          address?: string | null
          antenna_type?: string | null
          approval_date?: string | null
          approval_letter_url?: string | null
          backup_power?: string | null
          battery_bank_type?: string | null
          cast_status?: string | null
          civil_rfi?: string | null
          contractor_name?: string | null
          created_at?: string
          current_phase?: string | null
          dimensions?: string | null
          distance_nearest_bts?: number | null
          district?: string
          earthing_resistance?: number | null
          elevation?: number | null
          equipment_shelter?: string | null
          estimated_cost?: number | null
          final_approval_by?: string | null
          foundation_depth?: number | null
          generator_capacity?: number | null
          grid_transformer_capacity?: string | null
          handover_to_vendor?: string | null
          id?: string
          last_inspection_date?: string | null
          latitude?: number | null
          layout_plan_url?: string | null
          longitude?: number | null
          notes?: string | null
          number_of_antennas?: number | null
          number_of_battery_banks?: number | null
          on_air?: string | null
          planned_start_date?: string | null
          planning_approval_status?: string | null
          power_backup_type?: string | null
          power_certificate_url?: string | null
          power_requirement?: string | null
          power_rfi?: string | null
          power_rfi_status?: string | null
          power_source?: string | null
          progress_percent?: number | null
          project_name?: string | null
          project_review_status?: string | null
          region?: string
          review_notes?: string | null
          reviewed_by?: string | null
          scope?: string | null
          site_configuration?: string | null
          site_id_code?: string
          site_implementation_design?: string | null
          site_name?: string
          site_photo_url?: string | null
          site_type?: string | null
          soil_test?: string | null
          solar_capacity?: number | null
          status?: Database["public"]["Enums"]["site_status"]
          submitted_by?: string | null
          target_completion_date?: string | null
          terrain_type?: string | null
          tower_height?: number | null
          tower_material?: string | null
          tower_rig?: string | null
          tower_type?: string | null
          town?: string
          transmission_type?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          _arguments: Json
          _error_code: string
          _error_message: string
          _function_name: string
          _severity?: string
        }
        Returns: undefined
      }
      send_workflow_notification: {
        Args: {
          _link?: string
          _message: string
          _title: string
          _type?: string
          _user_ids: string[]
        }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "planning_team"
        | "procurement_team"
        | "project_team"
        | "power_team"
        | "rollout_team"
      feedback_status: "pending" | "accepted" | "rejected"
      site_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
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
  public: {
    Enums: {
      app_role: [
        "planning_team",
        "procurement_team",
        "project_team",
        "power_team",
        "rollout_team",
      ],
      feedback_status: ["pending", "accepted", "rejected"],
      site_status: ["pending", "approved", "rejected"],
    },
  },
} as const
