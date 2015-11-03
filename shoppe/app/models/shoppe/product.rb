require 'roo'

module Shoppe
  class Product < ActiveRecord::Base

    self.table_name = 'shoppe_products'

    # Add dependencies for products
    require_dependency 'shoppe/product/product_attributes'
    require_dependency 'shoppe/product/variants'

    extend ApplicationHelper

    #mount Carrierwave uploader
    mount_uploader :default_image, ImageUploader
    mount_uploader :image2, ImageUploader
    mount_uploader :image3, ImageUploader
    mount_uploader :image4, ImageUploader
    mount_uploader :image5, ImageUploader
    mount_uploader :image6, ImageUploader

    # Products have a default_image and a data_sheet
    #attachment :default_image
    #attachment :image2
    #attachment :image3
    #attachment :image4
    #attachment :image5
    #attachment :image6
    #attachment :data_sheet

    # The product's category
    #
    # @return [Shoppe::ProductCategory]
    belongs_to :product_category, :class_name => 'Shoppe::ProductCategory'
    belongs_to :product_subcategory, :class_name => 'Shoppe::ProductCategory', foreign_key: "subcategory_id"

    # The product's tax rate
    #
    # @return [Shoppe::TaxRate]
    belongs_to :tax_rate, :class_name => "Shoppe::TaxRate"

    # Ordered items which are associated with this product
    has_many :order_items, :dependent => :restrict_with_exception, :class_name => 'Shoppe::OrderItem', :as => :ordered_item

    # Orders which have ordered this product
    has_many :orders, :through => :order_items, :class_name => 'Shoppe::Order'

    # Stock level adjustments for this product
    has_many :stock_level_adjustments, :dependent => :destroy, :class_name => 'Shoppe::StockLevelAdjustment', :as => :item

    #
    has_many :product_associations, dependent: :destroy, class_name: 'Shoppe::IncludedProduct', foreign_key: "parent_product_id"
    has_many :included_products, through: :product_associations, dependent: :destroy, class_name: 'Shoppe::Product'

    # Validations
    with_options :if => Proc.new { |p| p.parent.nil? } do |product|
      product.validates :product_category_id, :presence => true
      product.validates :product_subcategory_id, :presence => true
      #product.validates :description, :presence => true
      #product.validates :short_description, :presence => true
    end
    validates :name, :presence => true
    validates :sku, :presence => true
    validates_uniqueness_of :name, :scope => :sku
    validates_uniqueness_of :sku, :scope => :name
    validates :permalink, :presence => true, :uniqueness => true, :permalink => true

    validates :weight, :numericality => true
    validates :width, numericality: {only_float: true}
    validates :height, numericality: {only_float: true}
    validates :depth, numericality: {only_float: true}
    validates :price, :numericality => true
    validates :cost_price, :numericality => true, :allow_blank => true

    # Before validation, set the permalink if we don't already have one
    before_validation { self.permalink = "#{self.name.parameterize}-#{self.sku}" if self.permalink.blank? && self.name.is_a?(String) }

    # All active products
    scope :active, -> { where(:active => true) }

    # All featured products
    scope :featured, -> {where(:featured => true)}

    # All products ordered with default items first followed by name ascending
    scope :ordered, -> {order(:default => :desc, :name => :asc)}


    # All products with furniture_categories
    scope :furniture, -> { joins(:product_category)
                            .where(shoppe_product_categories:
                              {
                                permalink: furniture_categories
                              }
                            )
                          }

    # Return the name of the product
    #
    # @return [String]
    def full_name
      self.parent ? "#{self.parent.name} (#{name})" : name
    end

    # Is this product orderable?
    #
    # @return [Boolean]
    def orderable?
      return false unless self.active?
      return false if self.has_variants?
      true
    end

    # The price for the product
    #
    # @return [BigDecimal]
    def price
      self.default_variant ? self.default_variant.price : read_attribute(:price)
    end

    # Is this product currently in stock?
    #
    # @return [Boolean]
    def in_stock?
      self.default_variant ? self.default_variant.in_stock? : (stock_control? ? stock > 0 : true)
    end

    # Return the total number of items currently in stock
    #
    # @return [Fixnum]
    def stock
      self.stock_level_adjustments.sum(:adjustment)
    end

    def update_included_products ids
      ids.map!(&:to_i)

      to_create_ids = ids - product_associations.map(&:included_product_id)
      to_destroy_ids = product_associations.map(&:included_product_id) - ids

      product_associations.where(included_product_id: to_destroy_ids).destroy_all

      to_create_ids.each do |id|
        product_associations.create(included_product_id: id)
      end

     end

    # Search for products which include the given attributes and return an active record
    # scope of these products. Chainable with other scopes and with_attributes methods.
    # For example:
    #
    #   Shoppe::Product.active.with_attribute('Manufacturer', 'Apple').with_attribute('Model', ['Macbook', 'iPhone'])
    #
    # @return [Enumerable]
    def self.with_attributes(key, values)
      product_ids = Shoppe::ProductAttribute.searchable.where(:key => key, :value => values).pluck(:product_id).uniq
      where(:id => product_ids)
    end

    # Imports products from a spreadsheet file
    # Example:
    #
    #   Shoppe:Product.import("path/to/file.csv")
    def self.import(file)
      field_array = ['Product Name', 'SKU', 'Category Name', 'Subcategory Name', 'Permalink', 'Description', 'Short Description', 'Featured',
                     "What's in the box?", 'Width', 'Height', 'Depth', 'Seat Width', 'Seat Depth', 'Seat Height', 'Arm Height',
                     'CAD Price', 'USA Price', 'Default Image', 'Image2', 'Image3', 'Image4', 'Image5', 'Image6']
      attr_active_array = ['Color', 'Item 2 Width', 'Item 2 Depth', 'Item 2 Height', 'Item 3 Width', 'Item 3 Depth', 'Item 3 Height', 'NW', 'Technical Description',
                           'Features', 'Instructions', 'Outdoor']
      spreadsheet = open_spreadsheet(file)
      spreadsheet.default_sheet = spreadsheet.sheets.first
      header = spreadsheet.row(1)
      errors = []
      success_count = 0
      (2..spreadsheet.last_row).each_with_index do |i, index|
        begin
          row = Hash[[header, spreadsheet.row(i)].transpose]
          product = Shoppe::Product.where(name: row["Product Name"], sku: row['SKU']).first_or_create
          product.product_category_id = Shoppe::ProductCategory.where(name: row["Category Name"]).first_or_create.id
          product.product_subcategory_id = Shoppe::ProductCategory.where(name: row["Subcategory Name"]).first_or_create.id
          #product.permalink = row["Permalink"] if row["Permalink"]
          product.description = row["Description"] if row["Description"]
          product.short_description = row["Short Description"] if row["Short Description"]
          product.save!
          product.featured = row["Featured"].to_i if row["Featured"]
          product.in_the_box = row["What's in the box?"] if row["What's in the box?"]
          product.width = row["Width"].to_f if row["Width"]
          product.height = row["Height"].to_f if row["Height"]
          product.depth = row["Depth"].to_f if row["Depth"]
          product.seat_width = row["Seat Width"].to_f if row["Seat Width"]
          product.seat_depth = row["Seat Depth"].to_f if row["Seat Depth"]
          product.seat_height = row["Seat Height"].to_f if row["Seat Height"]
          product.arm_height = row["Arm Height"].to_f if row["Arm Height"]
          product.price = row["CAD Price"].to_d if row["CAD Price"]
          product.cost_price = row["USA Price"].to_d if row["USA Price"]
          product.url_default_image = row["Default Image"] if row["Default Image"]
          product.url_image2 = row["Image2"] if row["Image2"]
          product.url_image3 = row["Image3"] if row["Image3"]
          product.url_image4 = row["Image4"] if row["Image4"]
          product.url_image5 = row["Image5"] if row["Image5"]
          product.url_image6 = row["Image6"] if row["Image6"]
          product.save!
          field_array.each{|element| row.delete(element)}
          row.each do |key, value|
            next unless value.present?
            product_attr = Shoppe::ProductAttribute.where(product_id: product.id, key: key).first_or_create
            product_attr.public = attr_active_array.include?(key)
            product_attr.searchable = false
            product_attr.value = value
            product_attr.save!
          end
        success_count += 1
        rescue => error
          errors << {error: error.message, row_index: index, row: row}
        end
      end
      errors.empty? ? 'Import success' : "Success row count: #{success_count}. Column #{errors.first[:row_index]}, error: #{errors.first[:error]}."
    end

    def self.open_spreadsheet(file)
      case File.extname(file.original_filename)
      when ".csv" then Roo::CSV.new(file.path)
      when ".xls" then Roo::Excel.new(file.path)
      when ".xlsx" then Roo::Excelx.new(file.path)
      else raise I18n.t('shoppe.imports.errors.unknown_format', filename: File.original_filename)
      end
    end

  end
end
