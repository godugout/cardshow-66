export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      auction_bids: {
        Row: {
          amount: number
          bid_type: string
          bidder_id: string
          created_at: string
          id: string
          is_winning_bid: boolean
          listing_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          bid_type?: string
          bidder_id: string
          created_at?: string
          id?: string
          is_winning_bid?: boolean
          listing_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bid_type?: string
          bidder_id?: string
          created_at?: string
          id?: string
          is_winning_bid?: boolean
          listing_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_cards: {
        Row: {
          added_at: string
          bundle_id: string
          card_id: string
          id: string
        }
        Insert: {
          added_at?: string
          bundle_id: string
          card_id: string
          id?: string
        }
        Update: {
          added_at?: string
          bundle_id?: string
          card_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_cards_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          price: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          price: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          price?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      card_likes: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_likes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          activity_data: Json | null
          activity_type: string | null
          bundle_id: string | null
          category: string | null
          created_at: string | null
          creator_name: string | null
          creator_verified: boolean | null
          current_case: string | null
          description: string | null
          for_sale: boolean | null
          id: string
          image_url: string | null
          is_public: boolean | null
          like_count: number | null
          price: number | null
          rarity: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          watchers_count: number | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type?: string | null
          bundle_id?: string | null
          category?: string | null
          created_at?: string | null
          creator_name?: string | null
          creator_verified?: boolean | null
          current_case?: string | null
          description?: string | null
          for_sale?: boolean | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          like_count?: number | null
          price?: number | null
          rarity?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          watchers_count?: number | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string | null
          bundle_id?: string | null
          category?: string | null
          created_at?: string | null
          creator_name?: string | null
          creator_verified?: boolean | null
          current_case?: string | null
          description?: string | null
          for_sale?: boolean | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          like_count?: number | null
          price?: number | null
          rarity?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          watchers_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          added_at: string | null
          card_id: string
          collection_id: string
          id: string
          position: number | null
        }
        Insert: {
          added_at?: string | null
          card_id: string
          collection_id: string
          id?: string
          position?: number | null
        }
        Update: {
          added_at?: string | null
          card_id?: string
          collection_id?: string
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crd_elements: {
        Row: {
          asset_url: string
          category: string
          compatibility_frames: string[] | null
          created_at: string | null
          creator_user_id: string | null
          description: string | null
          dimensions: Json | null
          element_type: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          name: string
          position_type: string | null
          positioning: Json | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          asset_url: string
          category?: string
          compatibility_frames?: string[] | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          dimensions?: Json | null
          element_type: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          position_type?: string | null
          positioning?: Json | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_url?: string
          category?: string
          compatibility_frames?: string[] | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          dimensions?: Json | null
          element_type?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          position_type?: string | null
          positioning?: Json | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crd_frames: {
        Row: {
          asset_url: string
          category: string
          compatibility_tags: string[] | null
          created_at: string | null
          creator_user_id: string | null
          description: string | null
          dimensions: Json | null
          download_count: number | null
          frame_type: string
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          metadata: Json | null
          name: string
          preview_url: string
          pricing: Json | null
          rarity: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          asset_url: string
          category?: string
          compatibility_tags?: string[] | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          dimensions?: Json | null
          download_count?: number | null
          frame_type?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          preview_url: string
          pricing?: Json | null
          rarity?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_url?: string
          category?: string
          compatibility_tags?: string[] | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          dimensions?: Json | null
          download_count?: number | null
          frame_type?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          preview_url?: string
          pricing?: Json | null
          rarity?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crd_materials: {
        Row: {
          asset_url: string
          category: string
          created_at: string | null
          creator_user_id: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_seamless: boolean | null
          material_type: string
          name: string
          preview_url: string
          properties: Json | null
          thumbnail_url: string | null
          tiling: Json | null
          updated_at: string | null
        }
        Insert: {
          asset_url: string
          category?: string
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_seamless?: boolean | null
          material_type: string
          name: string
          preview_url: string
          properties?: Json | null
          thumbnail_url?: string | null
          tiling?: Json | null
          updated_at?: string | null
        }
        Update: {
          asset_url?: string
          category?: string
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_seamless?: boolean | null
          material_type?: string
          name?: string
          preview_url?: string
          properties?: Json | null
          thumbnail_url?: string | null
          tiling?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crd_templates: {
        Row: {
          asset_bundle_url: string | null
          category: string
          complexity: string | null
          created_at: string | null
          creator_user_id: string | null
          description: string | null
          download_count: number | null
          elements: Json | null
          frame_id: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          layout: Json | null
          materials: Json | null
          name: string
          preview_url: string
          pricing: Json | null
          rating: number | null
          rating_count: number | null
          style: string
          updated_at: string | null
        }
        Insert: {
          asset_bundle_url?: string | null
          category?: string
          complexity?: string | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          download_count?: number | null
          elements?: Json | null
          frame_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          layout?: Json | null
          materials?: Json | null
          name: string
          preview_url: string
          pricing?: Json | null
          rating?: number | null
          rating_count?: number | null
          style?: string
          updated_at?: string | null
        }
        Update: {
          asset_bundle_url?: string | null
          category?: string
          complexity?: string | null
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          download_count?: number | null
          elements?: Json | null
          frame_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          layout?: Json | null
          materials?: Json | null
          name?: string
          preview_url?: string
          pricing?: Json | null
          rating?: number | null
          rating_count?: number | null
          style?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crd_templates_frame_id_fkey"
            columns: ["frame_id"]
            isOneToOne: false
            referencedRelation: "crd_frames"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_courses: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      creator_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          auction_end_time: string | null
          buy_now_price: number | null
          card_id: string | null
          created_at: string | null
          current_bid: number | null
          id: string
          listing_type: string | null
          price: number
          starting_bid: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auction_end_time?: string | null
          buy_now_price?: number | null
          card_id?: string | null
          created_at?: string | null
          current_bid?: number | null
          id?: string
          listing_type?: string | null
          price: number
          starting_bid?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auction_end_time?: string | null
          buy_now_price?: number | null
          card_id?: string | null
          created_at?: string | null
          current_bid?: number | null
          id?: string
          listing_type?: string | null
          price?: number
          starting_bid?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          access_level: string | null
          asset_reference_id: string | null
          asset_type: string
          bucket_id: string
          created_at: string | null
          duration: number | null
          file_name: string
          file_path: string
          file_size: number | null
          height: number | null
          id: string
          is_optimized: boolean | null
          metadata: Json | null
          mime_type: string | null
          optimization_variants: Json | null
          tags: string[] | null
          thumbnail_path: string | null
          updated_at: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          access_level?: string | null
          asset_reference_id?: string | null
          asset_type: string
          bucket_id: string
          created_at?: string | null
          duration?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          optimization_variants?: Json | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          access_level?: string | null
          asset_reference_id?: string | null
          asset_type?: string
          bucket_id?: string
          created_at?: string | null
          duration?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          optimization_variants?: Json | null
          tags?: string[] | null
          thumbnail_path?: string | null
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          card_id: string | null
          created_at: string
          currency: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          card_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          card_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cards_count: number | null
          created_at: string | null
          creator_verified: boolean | null
          credits_balance: number | null
          display_name: string | null
          email: string | null
          experience: number | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_verified: boolean | null
          level: number | null
          subscription_tier: string | null
          unlocked_cases: string[] | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cards_count?: number | null
          created_at?: string | null
          creator_verified?: boolean | null
          credits_balance?: number | null
          display_name?: string | null
          email?: string | null
          experience?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_verified?: boolean | null
          level?: number | null
          subscription_tier?: string | null
          unlocked_cases?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cards_count?: number | null
          created_at?: string | null
          creator_verified?: boolean | null
          credits_balance?: number | null
          display_name?: string | null
          email?: string | null
          experience?: number | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_verified?: boolean | null
          level?: number | null
          subscription_tier?: string | null
          unlocked_cases?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trade_history: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trade_items: {
        Row: {
          card_id: string | null
          cash_value: number | null
          created_at: string | null
          credits_value: number | null
          id: string
          owner_type: string
          quantity: number | null
          trade_id: string
        }
        Insert: {
          card_id?: string | null
          cash_value?: number | null
          created_at?: string | null
          credits_value?: number | null
          id?: string
          owner_type: string
          quantity?: number | null
          trade_id: string
        }
        Update: {
          card_id?: string | null
          cash_value?: number | null
          created_at?: string | null
          credits_value?: number | null
          id?: string
          owner_type?: string
          quantity?: number | null
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_items_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_items_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          trade_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          trade_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          trade_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string | null
          creator_id: string
          expires_at: string | null
          id: string
          message: string | null
          recipient_id: string | null
          status: string | null
          trade_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          status?: string | null
          trade_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          status?: string | null
          trade_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trading_room_participants: {
        Row: {
          id: string
          is_online: boolean | null
          joined_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "trading_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_rooms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
          room_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
          room_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
          room_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
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
      calculate_daily_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          user_identifier: string
          action_type: string
          max_attempts?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
      get_auction_bids_anonymized: {
        Args: { auction_listing_id: string }
        Returns: {
          id: string
          listing_id: string
          amount: number
          bid_type: string
          is_winning_bid: boolean
          created_at: string
          bidder_display_name: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      has_subscription_tier: {
        Args: { _user_id: string; _required_tier: string }
        Returns: boolean
      }
      has_sufficient_credits: {
        Args: { _user_id: string; _amount: number }
        Returns: boolean
      }
      validate_file_upload: {
        Args: { file_name: string; file_size: number; mime_type: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "creator" | "user"
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
      app_role: ["admin", "moderator", "creator", "user"],
    },
  },
} as const
