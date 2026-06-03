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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brochures: {
        Row: {
          created_at: string
          created_by: string | null
          generated_at: string | null
          id: string
          org_id: string
          share_token: string | null
          status: string
          type: Database["public"]["Enums"]["brochure_type"]
          updated_at: string
          yacht_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_at?: string | null
          id?: string
          org_id: string
          share_token?: string | null
          status?: string
          type?: Database["public"]["Enums"]["brochure_type"]
          updated_at?: string
          yacht_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_at?: string | null
          id?: string
          org_id?: string
          share_token?: string | null
          status?: string
          type?: Database["public"]["Enums"]["brochure_type"]
          updated_at?: string
          yacht_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brochures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brochures_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brochures_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_broker: string | null
          categories: Database["public"]["Enums"]["client_category"][]
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          gdpr_consent: boolean
          gdpr_consent_at: string | null
          id: string
          last_interaction_at: string | null
          name: string
          org_id: string
          phone: string | null
          preferences: Json
          source: string | null
          temperature: Database["public"]["Enums"]["temperature"] | null
          updated_at: string
        }
        Insert: {
          assigned_broker?: string | null
          categories?: Database["public"]["Enums"]["client_category"][]
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gdpr_consent?: boolean
          gdpr_consent_at?: string | null
          id?: string
          last_interaction_at?: string | null
          name: string
          org_id: string
          phone?: string | null
          preferences?: Json
          source?: string | null
          temperature?: Database["public"]["Enums"]["temperature"] | null
          updated_at?: string
        }
        Update: {
          assigned_broker?: string | null
          categories?: Database["public"]["Enums"]["client_category"][]
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gdpr_consent?: boolean
          gdpr_consent_at?: string | null
          id?: string
          last_interaction_at?: string | null
          name?: string
          org_id?: string
          phone?: string | null
          preferences?: Json
          source?: string | null
          temperature?: Database["public"]["Enums"]["temperature"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_broker_fkey"
            columns: ["assigned_broker"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          org_id: string
          type: Database["public"]["Enums"]["company_type"]
          updated_at: string
          vat_id: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          org_id: string
          type?: Database["public"]["Enums"]["company_type"]
          updated_at?: string
          vat_id?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          org_id?: string
          type?: Database["public"]["Enums"]["company_type"]
          updated_at?: string
          vat_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          opportunity_id: string | null
          org_id: string
          owner_id: string | null
          storage_path: string | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          version: number
          yacht_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          opportunity_id?: string | null
          org_id: string
          owner_id?: string | null
          storage_path?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
          yacht_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          opportunity_id?: string | null
          org_id?: string
          owner_id?: string | null
          storage_path?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
          yacht_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          broker_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string | null
          notes: string | null
          occurred_at: string
          opportunity_id: string | null
          org_id: string
          outcome: string | null
          type: Database["public"]["Enums"]["interaction_type"]
          yacht_id: string | null
        }
        Insert: {
          broker_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          org_id: string
          outcome?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
          yacht_id?: string | null
        }
        Update: {
          broker_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          org_id?: string
          outcome?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
          yacht_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_confidence: number | null
          assigned_broker: string | null
          converted_client_id: string | null
          created_at: string
          created_by: string | null
          do_not_contact: boolean
          email: string | null
          id: string
          lob: Database["public"]["Enums"]["lob"] | null
          name: string | null
          org_id: string
          phone: string | null
          preferences: Json
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          sub_source: string | null
          temperature: Database["public"]["Enums"]["temperature"] | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          assigned_broker?: string | null
          converted_client_id?: string | null
          created_at?: string
          created_by?: string | null
          do_not_contact?: boolean
          email?: string | null
          id?: string
          lob?: Database["public"]["Enums"]["lob"] | null
          name?: string | null
          org_id: string
          phone?: string | null
          preferences?: Json
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          sub_source?: string | null
          temperature?: Database["public"]["Enums"]["temperature"] | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          assigned_broker?: string | null
          converted_client_id?: string | null
          created_at?: string
          created_by?: string | null
          do_not_contact?: boolean
          email?: string | null
          id?: string
          lob?: Database["public"]["Enums"]["lob"] | null
          name?: string | null
          org_id?: string
          phone?: string | null
          preferences?: Json
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          sub_source?: string | null
          temperature?: Database["public"]["Enums"]["temperature"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_broker_fkey"
            columns: ["assigned_broker"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_client_id_fkey"
            columns: ["converted_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      lob_stages: {
        Row: {
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          lob: Database["public"]["Enums"]["lob"]
          name: string
          org_id: string
          position: number
          probability: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          lob: Database["public"]["Enums"]["lob"]
          name: string
          org_id: string
          position: number
          probability?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          lob?: Database["public"]["Enums"]["lob"]
          name?: string
          org_id?: string
          position?: number
          probability?: number
        }
        Relationships: [
          {
            foreignKeyName: "lob_stages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          org_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          org_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_broker: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          expected_close: string | null
          id: string
          lead_id: string | null
          lob: Database["public"]["Enums"]["lob"]
          lost_reason: string | null
          org_id: string
          probability: number | null
          stage_id: string | null
          status: Database["public"]["Enums"]["opp_status"]
          title: string
          updated_at: string
          value: number | null
          won_at: string | null
          yacht_id: string | null
        }
        Insert: {
          assigned_broker?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expected_close?: string | null
          id?: string
          lead_id?: string | null
          lob: Database["public"]["Enums"]["lob"]
          lost_reason?: string | null
          org_id: string
          probability?: number | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["opp_status"]
          title: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
          yacht_id?: string | null
        }
        Update: {
          assigned_broker?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expected_close?: string | null
          id?: string
          lead_id?: string | null
          lob?: Database["public"]["Enums"]["lob"]
          lost_reason?: string | null
          org_id?: string
          probability?: number | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["opp_status"]
          title?: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
          yacht_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_broker_fkey"
            columns: ["assigned_broker"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "lob_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          account_type: string | null
          created_at: string
          fleet_size: string | null
          id: string
          name: string
          region: string | null
          settings: Json
          slug: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          fleet_size?: string | null
          id?: string
          name: string
          region?: string | null
          settings?: Json
          slug?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          created_at?: string
          fleet_size?: string | null
          id?: string
          name?: string
          region?: string | null
          settings?: Json
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      owners: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owners_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          office_id: string | null
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_initials?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          office_id?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_initials?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          office_id?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          opportunity_id: string | null
          org_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          yacht_id: string | null
        }
        Insert: {
          assignee?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          org_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          yacht_id?: string | null
        }
        Update: {
          assignee?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          org_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          yacht_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_fkey"
            columns: ["assignee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_yacht_id_fkey"
            columns: ["yacht_id"]
            isOneToOne: false
            referencedRelation: "yachts"
            referencedColumns: ["id"]
          },
        ]
      }
      yachts: {
        Row: {
          builder: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          hero_color: string | null
          hull_id: string | null
          id: string
          imo: string | null
          loa_m: number | null
          lob: Database["public"]["Enums"]["lob"]
          name: string
          office_id: string | null
          org_id: string
          owner_id: string | null
          price: number | null
          primary_broker: string | null
          region: string | null
          specs: Json
          status: Database["public"]["Enums"]["yacht_status"]
          type: Database["public"]["Enums"]["yacht_type"] | null
          updated_at: string
          year: number | null
        }
        Insert: {
          builder?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          hero_color?: string | null
          hull_id?: string | null
          id?: string
          imo?: string | null
          loa_m?: number | null
          lob?: Database["public"]["Enums"]["lob"]
          name: string
          office_id?: string | null
          org_id: string
          owner_id?: string | null
          price?: number | null
          primary_broker?: string | null
          region?: string | null
          specs?: Json
          status?: Database["public"]["Enums"]["yacht_status"]
          type?: Database["public"]["Enums"]["yacht_type"] | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          builder?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          hero_color?: string | null
          hull_id?: string | null
          id?: string
          imo?: string | null
          loa_m?: number | null
          lob?: Database["public"]["Enums"]["lob"]
          name?: string
          office_id?: string | null
          org_id?: string
          owner_id?: string | null
          price?: number | null
          primary_broker?: string | null
          region?: string | null
          specs?: Json
          status?: Database["public"]["Enums"]["yacht_status"]
          type?: Database["public"]["Enums"]["yacht_type"] | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "yachts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yachts_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yachts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yachts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yachts_primary_broker_fkey"
            columns: ["primary_broker"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      current_org_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      provision_user: {
        Args: { p_email: string; p_meta: Json; p_user_id: string }
        Returns: undefined
      }
      seed_lob_stages: { Args: { p_org: string }; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "executive"
        | "senior_broker"
        | "broker"
        | "marketing"
        | "operations"
        | "client"
      brochure_type:
        | "sale"
        | "charter"
        | "full_spec"
        | "co_ownership"
        | "one_page"
      client_category:
        | "buyer"
        | "seller"
        | "charter_guest"
        | "co_owner"
        | "owner"
      company_type: "owner" | "client" | "partner" | "broker" | "other"
      document_type:
        | "yacht_spec"
        | "survey"
        | "sea_trial"
        | "purchase_agreement"
        | "charter_contract"
        | "invoice"
        | "loi"
        | "nda"
        | "insurance"
        | "owner_mandate"
        | "marketing"
        | "other"
      interaction_type:
        | "call"
        | "email"
        | "meeting"
        | "viewing"
        | "brochure_share"
        | "whatsapp"
        | "note"
        | "task_completion"
        | "event"
        | "other"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "converted"
        | "unqualified"
        | "lost"
      lob:
        | "sale"
        | "charter"
        | "new_build"
        | "co_ownership"
        | "trade"
        | "services"
      opp_status: "open" | "won" | "lost"
      task_priority: "high" | "medium" | "low"
      task_status:
        | "todo"
        | "in_progress"
        | "waiting"
        | "completed"
        | "cancelled"
      temperature: "hot" | "warm" | "cold"
      yacht_status:
        | "draft"
        | "active"
        | "under_offer"
        | "conditional"
        | "sold"
        | "off_market"
        | "expired"
        | "charter_only"
        | "new_build"
        | "co_ownership"
      yacht_type: "motor" | "sail"
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
        "admin",
        "executive",
        "senior_broker",
        "broker",
        "marketing",
        "operations",
        "client",
      ],
      brochure_type: [
        "sale",
        "charter",
        "full_spec",
        "co_ownership",
        "one_page",
      ],
      client_category: [
        "buyer",
        "seller",
        "charter_guest",
        "co_owner",
        "owner",
      ],
      company_type: ["owner", "client", "partner", "broker", "other"],
      document_type: [
        "yacht_spec",
        "survey",
        "sea_trial",
        "purchase_agreement",
        "charter_contract",
        "invoice",
        "loi",
        "nda",
        "insurance",
        "owner_mandate",
        "marketing",
        "other",
      ],
      interaction_type: [
        "call",
        "email",
        "meeting",
        "viewing",
        "brochure_share",
        "whatsapp",
        "note",
        "task_completion",
        "event",
        "other",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "converted",
        "unqualified",
        "lost",
      ],
      lob: [
        "sale",
        "charter",
        "new_build",
        "co_ownership",
        "trade",
        "services",
      ],
      opp_status: ["open", "won", "lost"],
      task_priority: ["high", "medium", "low"],
      task_status: ["todo", "in_progress", "waiting", "completed", "cancelled"],
      temperature: ["hot", "warm", "cold"],
      yacht_status: [
        "draft",
        "active",
        "under_offer",
        "conditional",
        "sold",
        "off_market",
        "expired",
        "charter_only",
        "new_build",
        "co_ownership",
      ],
      yacht_type: ["motor", "sail"],
    },
  },
} as const
