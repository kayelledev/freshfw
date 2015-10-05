# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151004932638) do

  create_table "items", force: :cascade do |t|
    t.string   "item_sku"
    t.string   "item_name"
    t.string   "item_type"
    t.string   "item_description"
    t.string   "item_dimensions"
    t.string   "item_materials"
    t.string   "item_Photo_1"
    t.string   "item_Photo_2"
    t.string   "item_Photo_3"
    t.string   "item_Photo_4"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "nifty_attachments", force: :cascade do |t|
    t.integer  "parent_id"
    t.string   "parent_type"
    t.string   "token"
    t.string   "digest"
    t.string   "role"
    t.string   "file_name"
    t.string   "file_type"
    t.binary   "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "nifty_key_value_store", force: :cascade do |t|
    t.integer "parent_id"
    t.string  "parent_type"
    t.string  "group"
    t.string  "name"
    t.string  "value"
  end

  create_table "room_items", force: :cascade do |t|
    t.integer  "room_id"
    t.integer  "item_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rooms", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "width",       default: 0
    t.integer  "height",      default: 0
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  create_table "shoppe_countries", force: :cascade do |t|
    t.string  "name"
    t.string  "code2"
    t.string  "code3"
    t.string  "continent"
    t.string  "tld"
    t.string  "currency"
    t.boolean "eu_member", default: false
  end

  create_table "shoppe_delivery_service_prices", force: :cascade do |t|
    t.integer  "delivery_service_id"
    t.string   "code"
    t.decimal  "price",               precision: 8, scale: 2
    t.decimal  "cost_price",          precision: 8, scale: 2
    t.integer  "tax_rate_id"
    t.decimal  "min_weight",          precision: 8, scale: 2
    t.decimal  "max_weight",          precision: 8, scale: 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "country_ids"
  end

  add_index "shoppe_delivery_service_prices", ["delivery_service_id"], name: "index_shoppe_delivery_service_prices_on_delivery_service_id"
  add_index "shoppe_delivery_service_prices", ["max_weight"], name: "index_shoppe_delivery_service_prices_on_max_weight"
  add_index "shoppe_delivery_service_prices", ["min_weight"], name: "index_shoppe_delivery_service_prices_on_min_weight"
  add_index "shoppe_delivery_service_prices", ["price"], name: "index_shoppe_delivery_service_prices_on_price"

  create_table "shoppe_delivery_services", force: :cascade do |t|
    t.string   "name"
    t.string   "code"
    t.boolean  "default",      default: false
    t.boolean  "active",       default: true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "courier"
    t.string   "tracking_url"
  end

  add_index "shoppe_delivery_services", ["active"], name: "index_shoppe_delivery_services_on_active"

  create_table "shoppe_included_products", force: :cascade do |t|
    t.integer "parent_product_id"
    t.integer "included_product_id"
  end

  create_table "shoppe_order_items", force: :cascade do |t|
    t.integer  "order_id"
    t.integer  "ordered_item_id"
    t.string   "ordered_item_type"
    t.integer  "quantity",                                  default: 1
    t.decimal  "unit_price",        precision: 8, scale: 2
    t.decimal  "unit_cost_price",   precision: 8, scale: 2
    t.decimal  "tax_amount",        precision: 8, scale: 2
    t.decimal  "tax_rate",          precision: 8, scale: 2
    t.decimal  "weight",            precision: 8, scale: 3
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "shoppe_order_items", ["order_id"], name: "index_shoppe_order_items_on_order_id"
  add_index "shoppe_order_items", ["ordered_item_id", "ordered_item_type"], name: "index_shoppe_order_items_ordered_item"

  create_table "shoppe_orders", force: :cascade do |t|
    t.string   "token"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "company"
    t.string   "billing_address1"
    t.string   "billing_address2"
    t.string   "billing_address3"
    t.string   "billing_address4"
    t.string   "billing_postcode"
    t.integer  "billing_country_id"
    t.string   "email_address"
    t.string   "phone_number"
    t.string   "status"
    t.datetime "received_at"
    t.datetime "accepted_at"
    t.datetime "shipped_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "delivery_service_id"
    t.decimal  "delivery_price",            precision: 8, scale: 2
    t.decimal  "delivery_cost_price",       precision: 8, scale: 2
    t.decimal  "delivery_tax_rate",         precision: 8, scale: 2
    t.decimal  "delivery_tax_amount",       precision: 8, scale: 2
    t.integer  "accepted_by"
    t.integer  "shipped_by"
    t.string   "consignment_number"
    t.datetime "rejected_at"
    t.integer  "rejected_by"
    t.string   "ip_address"
    t.text     "notes"
    t.boolean  "separate_delivery_address",                         default: false
    t.string   "delivery_name"
    t.string   "delivery_address1"
    t.string   "delivery_address2"
    t.string   "delivery_address3"
    t.string   "delivery_address4"
    t.string   "delivery_postcode"
    t.integer  "delivery_country_id"
    t.decimal  "amount_paid",               precision: 8, scale: 2, default: 0.0
    t.boolean  "exported",                                          default: false
    t.string   "invoice_number"
    t.decimal  "tax",                       precision: 5, scale: 2
  end

  add_index "shoppe_orders", ["delivery_service_id"], name: "index_shoppe_orders_on_delivery_service_id"
  add_index "shoppe_orders", ["received_at"], name: "index_shoppe_orders_on_received_at"
  add_index "shoppe_orders", ["token"], name: "index_shoppe_orders_on_token"

  create_table "shoppe_payments", force: :cascade do |t|
    t.integer  "order_id"
    t.decimal  "amount",            precision: 8, scale: 2, default: 0.0
    t.string   "reference"
    t.string   "method"
    t.boolean  "confirmed",                                 default: true
    t.boolean  "refundable",                                default: false
    t.decimal  "amount_refunded",   precision: 8, scale: 2, default: 0.0
    t.integer  "parent_payment_id"
    t.boolean  "exported",                                  default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "shoppe_payments", ["order_id"], name: "index_shoppe_payments_on_order_id"
  add_index "shoppe_payments", ["parent_payment_id"], name: "index_shoppe_payments_on_parent_payment_id"

  create_table "shoppe_product_attributes", force: :cascade do |t|
    t.integer  "product_id"
    t.string   "key"
    t.string   "value"
    t.integer  "position",   default: 1
    t.boolean  "searchable", default: true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "public",     default: true
  end

  add_index "shoppe_product_attributes", ["key"], name: "index_shoppe_product_attributes_on_key"
  add_index "shoppe_product_attributes", ["position"], name: "index_shoppe_product_attributes_on_position"
  add_index "shoppe_product_attributes", ["product_id"], name: "index_shoppe_product_attributes_on_product_id"

  create_table "shoppe_product_categories", force: :cascade do |t|
    t.string   "name"
    t.string   "permalink"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "parent_id"
    t.string   "default_image"
  end

  add_index "shoppe_product_categories", ["permalink"], name: "index_shoppe_product_categories_on_permalink"

# Could not dump table "shoppe_products" because of following NoMethodError
#   undefined method `[]' for nil:NilClass

  create_table "shoppe_settings", force: :cascade do |t|
    t.string "key"
    t.string "value"
    t.string "value_type"
  end

  add_index "shoppe_settings", ["key"], name: "index_shoppe_settings_on_key"

  create_table "shoppe_stock_level_adjustments", force: :cascade do |t|
    t.integer  "item_id"
    t.string   "item_type"
    t.string   "description"
    t.integer  "adjustment",  default: 0
    t.string   "parent_type"
    t.integer  "parent_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "shoppe_stock_level_adjustments", ["item_id", "item_type"], name: "index_shoppe_stock_level_adjustments_items"
  add_index "shoppe_stock_level_adjustments", ["parent_id", "parent_type"], name: "index_shoppe_stock_level_adjustments_parent"

  create_table "shoppe_tax_rates", force: :cascade do |t|
    t.string   "name"
    t.decimal  "rate",         precision: 8, scale: 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "country_ids"
    t.string   "address_type"
    t.string   "country"
    t.string   "province"
  end

  create_table "shoppe_users", force: :cascade do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email_address"
    t.string   "password_digest"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.string   "twitter"
    t.string   "facebook"
    t.boolean  "admin",                  default: false
  end

  add_index "shoppe_users", ["email_address"], name: "index_shoppe_users_on_email_address"

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "twitter"
    t.string   "facebook"
    t.boolean  "admin",                  default: false
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

end
