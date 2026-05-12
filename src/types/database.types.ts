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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'editor'
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'editor'
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'editor'
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          status: 'draft' | 'published' | 'archived'
          meta: Json
          created_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          status?: 'draft' | 'published' | 'archived'
          meta?: Json
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          status?: 'draft' | 'published' | 'archived'
          meta?: Json
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          id: string
          page_id: string
          type: string
          content: Json
          order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          type: string
          content?: Json
          order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          type?: string
          content?: Json
          order?: number
          visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          id: string
          page_id: string
          heading: string | null
          subheading: string | null
          cta_text: string | null
          cta_url: string | null
          image_url: string | null
          options: Json
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          heading?: string | null
          subheading?: string | null
          cta_text?: string | null
          cta_url?: string | null
          image_url?: string | null
          options?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          heading?: string | null
          subheading?: string | null
          cta_text?: string | null
          cta_url?: string | null
          image_url?: string | null
          options?: Json
          updated_at?: string
        }
        Relationships: []
      }
      nav_links: {
        Row: {
          id: string
          label: string
          url: string
          order: number
          parent_id: string | null
          visible: boolean
          open_in_new: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          url: string
          order?: number
          parent_id?: string | null
          visible?: boolean
          open_in_new?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          url?: string
          order?: number
          parent_id?: string | null
          visible?: boolean
          open_in_new?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          filename: string
          storage_path: string
          url: string
          size_bytes: number | null
          mime_type: string | null
          alt_text: string | null
          uploaded_by: string | null
          folder_id: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          filename: string
          storage_path: string
          url: string
          size_bytes?: number | null
          mime_type?: string | null
          alt_text?: string | null
          uploaded_by?: string | null
          folder_id?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          storage_path?: string
          url?: string
          size_bytes?: number | null
          mime_type?: string | null
          alt_text?: string | null
          uploaded_by?: string | null
          folder_id?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      slide_items: {
        Row: {
          id: string
          page_id: string
          image_url: string
          heading: string
          subheading: string
          cta_text: string | null
          cta_url: string | null
          badge_text: string | null
          order: number
          visible: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          image_url?: string
          heading?: string
          subheading?: string
          cta_text?: string | null
          cta_url?: string | null
          badge_text?: string | null
          order?: number
          visible?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          image_url?: string
          heading?: string
          subheading?: string
          cta_text?: string | null
          cta_url?: string | null
          badge_text?: string | null
          order?: number
          visible?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      donation_campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          description_html: string | null
          gallery_images: Json
          fundraising_end_at: string | null
          frequency_one_time: boolean
          frequency_weekly: boolean
          frequency_monthly: boolean
          frequency_every_n_months: number | null
          frequency_every_n_years: number | null
          recurring_commitment_months: number | null
          active: boolean
          preset_amounts: Json
          goal_amount: number | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          description_html?: string | null
          gallery_images?: Json
          fundraising_end_at?: string | null
          frequency_one_time?: boolean
          frequency_weekly?: boolean
          frequency_monthly?: boolean
          frequency_every_n_months?: number | null
          frequency_every_n_years?: number | null
          recurring_commitment_months?: number | null
          active?: boolean
          preset_amounts?: Json
          goal_amount?: number | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          description_html?: string | null
          gallery_images?: Json
          fundraising_end_at?: string | null
          frequency_one_time?: boolean
          frequency_weekly?: boolean
          frequency_monthly?: boolean
          frequency_every_n_months?: number | null
          frequency_every_n_years?: number | null
          recurring_commitment_months?: number | null
          active?: boolean
          preset_amounts?: Json
          goal_amount?: number | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          donor_email: string | null
          donor_name: string | null
          donor_message: string | null
          donor_type: string
          organization_name: string | null
          organization_contact_name: string | null
          donor_phone: string | null
          donor_address: string | null
          status: 'pending' | 'succeeded' | 'failed' | 'refunded'
          campaign_id: string | null
          community_campaign_id: string | null
          payment_method: string
          stripe_metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_message?: string | null
          donor_type?: string
          organization_name?: string | null
          organization_contact_name?: string | null
          donor_phone?: string | null
          donor_address?: string | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          campaign_id?: string | null
          community_campaign_id?: string | null
          payment_method?: string
          stripe_metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_message?: string | null
          donor_type?: string
          organization_name?: string | null
          organization_contact_name?: string | null
          donor_phone?: string | null
          donor_address?: string | null
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          campaign_id?: string | null
          community_campaign_id?: string | null
          payment_method?: string
          stripe_metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      page_revisions: {
        Row: {
          id: string
          page_id: string
          snapshot: Json
          label: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          snapshot: Json
          label?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          snapshot?: Json
          label?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: 'insert' | 'update' | 'delete'
          table_name: string
          record_id: string | null
          diff: Json
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: 'insert' | 'update' | 'delete'
          table_name: string
          record_id?: string | null
          diff?: Json
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: 'insert' | 'update' | 'delete'
          table_name?: string
          record_id?: string | null
          diff?: Json
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          site_name: string
          tagline: string | null
          contact_email: string | null
          logo_url: string | null
          favicon_url: string | null
          options: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          site_name?: string
          tagline?: string | null
          contact_email?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          options?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          site_name?: string
          tagline?: string | null
          contact_email?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          options?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      allowed_emails: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'editor'
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'editor'
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'editor'
          invited_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      community_campaign_categories: {
        Row: {
          id: string
          slug: string
          name: string
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_campaign_comments: {
        Row: {
          id: string
          campaign_id: string
          parent_id: string | null
          author_display_name: string
          author_email: string | null
          body: string
          status: 'pending' | 'approved' | 'rejected'
          moderated_at: string | null
          moderated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          parent_id?: string | null
          author_display_name: string
          author_email?: string | null
          body: string
          status?: 'pending' | 'approved' | 'rejected'
          moderated_at?: string | null
          moderated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          parent_id?: string | null
          author_display_name?: string
          author_email?: string | null
          body?: string
          status?: 'pending' | 'approved' | 'rejected'
          moderated_at?: string | null
          moderated_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      community_campaigns: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          body: string | null
          category_id: string
          featured_image_url: string
          image_alt: string
          location_label: string
          raised_display: string
          goal_display: string
          progress_percent: number
          donors_count_display: string
          days_left_display: string
          primary_action_label: string
          primary_action_url: string
          status: 'draft' | 'pending_review' | 'published' | 'archived'
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          donations_enabled: boolean
          volunteering_enabled: boolean
          featured_on_home: boolean
          preset_amounts: Json
          goal_amount: number | null
          currency: string
          frequency_one_time: boolean
          frequency_weekly: boolean
          frequency_monthly: boolean
          frequency_every_n_months: number | null
          frequency_every_n_years: number | null
          recurring_commitment_months: number | null
          gallery_images: Json
          fundraising_end_at: string | null
          donation_modal_description_html: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string
          body?: string | null
          category_id: string
          featured_image_url?: string
          image_alt?: string
          location_label?: string
          raised_display?: string
          goal_display?: string
          progress_percent?: number
          donors_count_display?: string
          days_left_display?: string
          primary_action_label?: string
          primary_action_url?: string
          status?: 'draft' | 'pending_review' | 'published' | 'archived'
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          donations_enabled?: boolean
          volunteering_enabled?: boolean
          featured_on_home?: boolean
          preset_amounts?: Json
          goal_amount?: number | null
          currency?: string
          frequency_one_time?: boolean
          frequency_weekly?: boolean
          frequency_monthly?: boolean
          frequency_every_n_months?: number | null
          frequency_every_n_years?: number | null
          recurring_commitment_months?: number | null
          gallery_images?: Json
          fundraising_end_at?: string | null
          donation_modal_description_html?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          body?: string | null
          category_id?: string
          featured_image_url?: string
          image_alt?: string
          location_label?: string
          raised_display?: string
          goal_display?: string
          progress_percent?: number
          donors_count_display?: string
          days_left_display?: string
          primary_action_label?: string
          primary_action_url?: string
          status?: 'draft' | 'pending_review' | 'published' | 'archived'
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          donations_enabled?: boolean
          volunteering_enabled?: boolean
          featured_on_home?: boolean
          preset_amounts?: Json
          goal_amount?: number | null
          currency?: string
          frequency_one_time?: boolean
          frequency_weekly?: boolean
          frequency_monthly?: boolean
          frequency_every_n_months?: number | null
          frequency_every_n_years?: number | null
          recurring_commitment_months?: number | null
          gallery_images?: Json
          fundraising_end_at?: string | null
          donation_modal_description_html?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          body: string | null
          category:
            | "development"
            | "health"
            | "organizational"
            | "international"
            | "social"
          featured: boolean
          image_url: string
          image_alt: string
          external_url: string
          status: "draft" | "published"
          published_at: string | null
          sort_order: number
          created_by: string | null
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string
          body?: string | null
          category?:
            | "development"
            | "health"
            | "organizational"
            | "international"
            | "social"
          featured?: boolean
          image_url: string
          image_alt?: string
          external_url?: string
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          department_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          body?: string | null
          category?:
            | "development"
            | "health"
            | "organizational"
            | "international"
            | "social"
          featured?: boolean
          image_url?: string
          image_alt?: string
          external_url?: string
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          department_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_page_settings: {
        Row: {
          id: number
          hero_eyebrow: string
          hero_headline_prefix: string
          hero_headline_accent: string
          hero_intro: string
          hero_image_url: string | null
          newsletter_title: string
          newsletter_body: string
          updated_at: string
        }
        Insert: {
          id?: number
          hero_eyebrow?: string
          hero_headline_prefix?: string
          hero_headline_accent?: string
          hero_intro?: string
          hero_image_url?: string | null
          newsletter_title?: string
          newsletter_body?: string
          updated_at?: string
        }
        Update: {
          id?: number
          hero_eyebrow?: string
          hero_headline_prefix?: string
          hero_headline_accent?: string
          hero_intro?: string
          hero_image_url?: string | null
          newsletter_title?: string
          newsletter_body?: string
          updated_at?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          id: string
          category: string
          category_id: string
          department_id: string | null
          title: string
          slug: string
          excerpt: string
          body: string | null
          cover_image_url: string
          cover_image_alt: string
          file_url: string
          external_url: string
          meta_line: string
          period_label: string
          tag_label: string
          tag_icon: string
          featured: boolean
          status: "draft" | "published"
          published_at: string | null
          sort_order: number
          custom_fields: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category?: string
          category_id: string
          department_id?: string | null
          title: string
          slug: string
          excerpt?: string
          body?: string | null
          cover_image_url?: string
          cover_image_alt?: string
          file_url?: string
          external_url?: string
          meta_line?: string
          period_label?: string
          tag_label?: string
          tag_icon?: string
          featured?: boolean
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          custom_fields?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          category_id?: string
          department_id?: string | null
          title?: string
          slug?: string
          excerpt?: string
          body?: string | null
          cover_image_url?: string
          cover_image_alt?: string
          file_url?: string
          external_url?: string
          meta_line?: string
          period_label?: string
          tag_label?: string
          tag_icon?: string
          featured?: boolean
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          custom_fields?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      publication_categories: {
        Row: {
          id: string
          slug: string
          label: string
          plural_label: string
          description: string
          icon: string
          accent: string
          kind: "pdf" | "story" | "external" | "hybrid"
          behavior: Json
          field_schema: Json
          is_system: boolean
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          plural_label?: string
          description?: string
          icon?: string
          accent?: string
          kind?: "pdf" | "story" | "external" | "hybrid"
          behavior?: Json
          field_schema?: Json
          is_system?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          plural_label?: string
          description?: string
          icon?: string
          accent?: string
          kind?: "pdf" | "story" | "external" | "hybrid"
          behavior?: Json
          field_schema?: Json
          is_system?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_categories: {
        Row: {
          id: string
          slug: string
          label: string
          plural_label: string
          description: string
          icon: string
          accent: string
          cover_image_url: string
          is_system: boolean
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          plural_label?: string
          description?: string
          icon?: string
          accent?: string
          cover_image_url?: string
          is_system?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          plural_label?: string
          description?: string
          icon?: string
          accent?: string
          cover_image_url?: string
          is_system?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          id: string
          category_id: string
          category: string
          title: string
          slug: string
          excerpt: string
          body: string | null
          cover_image_url: string
          cover_image_alt: string
          external_url: string
          tag_label: string
          tag_icon: string
          featured: boolean
          status: "draft" | "published"
          published_at: string | null
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          category?: string
          title: string
          slug: string
          excerpt?: string
          body?: string | null
          cover_image_url?: string
          cover_image_alt?: string
          external_url?: string
          tag_label?: string
          tag_icon?: string
          featured?: boolean
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          category?: string
          title?: string
          slug?: string
          excerpt?: string
          body?: string | null
          cover_image_url?: string
          cover_image_alt?: string
          external_url?: string
          tag_label?: string
          tag_icon?: string
          featured?: boolean
          status?: "draft" | "published"
          published_at?: string | null
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          slug: string
          summary: string
          description_html: string | null
          location_label: string
          location_address: string
          location_url: string
          starts_at: string
          ends_at: string | null
          is_all_day: boolean
          timezone: string
          category_label: string
          featured_image_url: string
          image_alt: string
          gallery_images: Json
          registration_url: string
          capacity_label: string
          contact_email: string
          contact_phone: string
          featured: boolean
          published_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          slug: string
          summary?: string
          description_html?: string | null
          location_label?: string
          location_address?: string
          location_url?: string
          starts_at: string
          ends_at?: string | null
          is_all_day?: boolean
          timezone?: string
          category_label?: string
          featured_image_url?: string
          image_alt?: string
          gallery_images?: Json
          registration_url?: string
          capacity_label?: string
          contact_email?: string
          contact_phone?: string
          featured?: boolean
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          slug?: string
          summary?: string
          description_html?: string | null
          location_label?: string
          location_address?: string
          location_url?: string
          starts_at?: string
          ends_at?: string | null
          is_all_day?: boolean
          timezone?: string
          category_label?: string
          featured_image_url?: string
          image_alt?: string
          gallery_images?: Json
          registration_url?: string
          capacity_label?: string
          contact_email?: string
          contact_phone?: string
          featured?: boolean
          published_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_message_replies: {
        Row: {
          id: string
          contact_message_id: string
          body_text: string
          sent_by: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          contact_message_id: string
          body_text: string
          sent_by?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          contact_message_id?: string
          body_text?: string
          sent_by?: string | null
          sent_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          status: Database["public"]["Enums"]["contact_message_status"]
          full_name: string
          email: string
          phone: string
          organization: string
          topic: string
          message_body: string
          staff_notes: string
          read_at: string | null
          read_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: Database["public"]["Enums"]["contact_message_status"]
          full_name: string
          email: string
          phone?: string
          organization?: string
          topic: string
          message_body: string
          staff_notes?: string
          read_at?: string | null
          read_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: Database["public"]["Enums"]["contact_message_status"]
          full_name?: string
          email?: string
          phone?: string
          organization?: string
          topic?: string
          message_body?: string
          staff_notes?: string
          read_at?: string | null
          read_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_broadcasts: {
        Row: {
          id: string
          subject: string
          html_body: string
          text_body: string
          recipient_count: number
          batches_sent: number
          failed_recipients: number
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          id?: string
          subject: string
          html_body: string
          text_body?: string
          recipient_count?: number
          batches_sent?: number
          failed_recipients?: number
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          id?: string
          subject?: string
          html_body?: string
          text_body?: string
          recipient_count?: number
          batches_sent?: number
          failed_recipients?: number
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          email_normalized: string
          unsubscribe_token: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          unsubscribe_token: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          unsubscribe_token?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          id: string
          status: Database["public"]["Enums"]["volunteer_application_status"]
          preferred_campaign_id: string | null
          full_name: string
          email: string
          phone: string
          city: string
          motivation: string
          skills_experience: string
          availability: string
          languages: string
          reviewed_at: string | null
          reviewed_by: string | null
          assigned_campaign_id: string | null
          assigned_role_label: string
          staff_notes: string
          rejection_reason: string
          acceptance_email_sent_at: string | null
          rejection_email_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: Database["public"]["Enums"]["volunteer_application_status"]
          preferred_campaign_id?: string | null
          full_name: string
          email: string
          phone?: string
          city?: string
          motivation?: string
          skills_experience?: string
          availability?: string
          languages?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          assigned_campaign_id?: string | null
          assigned_role_label?: string
          staff_notes?: string
          rejection_reason?: string
          acceptance_email_sent_at?: string | null
          rejection_email_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: Database["public"]["Enums"]["volunteer_application_status"]
          preferred_campaign_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          city?: string
          motivation?: string
          skills_experience?: string
          availability?: string
          languages?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          assigned_campaign_id?: string | null
          assigned_role_label?: string
          staff_notes?: string
          rejection_reason?: string
          acceptance_email_sent_at?: string | null
          rejection_email_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_campaign_public_fundraising_stats: {
        Args: { p_campaign_id: string }
        Returns: { raised_amount: number; donor_count: number }[]
      }
      community_campaign_staff_fundraising_stats: {
        Args: { p_campaign_id: string }
        Returns: { raised_amount: number; donor_count: number }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authenticated_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      newsletter_subscribe: {
        Args: { p_email: string }
        Returns: Json
      }
      newsletter_unsubscribe: {
        Args: { p_token: string }
        Returns: boolean
      }
      get_department_related_content: {
        Args: {
          p_department_id: string
          p_exclude_news_id?: string | null
          p_exclude_program_id?: string | null
          p_exclude_publication_id?: string | null
          p_limit?: number
          p_publication_category_slugs?: string[]
        }
        Returns: {
          source_kind: string
          entity_id: string
          title: string
          slug: string
          excerpt: string
          thumb_url: string | null
          published_at: string | null
          link_external: string | null
          link_path: string | null
          link_anchor: string | null
          meta_label: string | null
        }[]
      }
    }
    Enums: {
      user_role: 'admin' | 'editor'
      page_status: 'draft' | 'published' | 'archived'
      donation_status: 'pending' | 'succeeded' | 'failed' | 'refunded'
      audit_action: 'insert' | 'update' | 'delete'
      news_article_category:
        | 'development'
        | 'health'
        | 'organizational'
        | 'international'
        | 'social'
      news_article_status: 'draft' | 'published'
      publication_status: 'draft' | 'published'
      publication_category_kind: 'pdf' | 'story' | 'external' | 'hybrid'
      program_status: 'draft' | 'published'
      community_campaign_comment_status: 'pending' | 'approved' | 'rejected'
      contact_message_status: 'new' | 'read' | 'replied' | 'archived'
      community_campaign_status:
        | 'draft'
        | 'pending_review'
        | 'published'
        | 'archived'
      volunteer_application_status: 'pending' | 'accepted' | 'rejected'
      event_status: 'draft' | 'published' | 'cancelled'
    }
  }
}
