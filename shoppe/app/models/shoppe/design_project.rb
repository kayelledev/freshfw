module Shoppe
  class DesignProject < ActiveRecord::Base
    belongs_to :user, :class_name => 'Shoppe::User'
    belongs_to :product_category, :class_name => 'Shoppe::ProductCategory'
    has_many  :design_projects_products, :class_name => 'Shoppe::DesignProjectsProduct'
    has_many  :products, through: :design_projects_products, :class_name => 'Shoppe::Product'

    # has_many  :design_projects_filters, :class_name => 'Shoppe::DesignProjectsFilter'
    has_and_belongs_to_many  :filters, :class_name => 'Shoppe::Filter'
    has_many  :product_categories, through: :filters, source: :filter_element, source_type: 'Shoppe::ProductCategory'
    has_many  :colors, through: :filters, source: :filter_element, source_type: 'Shoppe::Color'
    has_many  :materials, through: :filters, source: :filter_element, source_type: 'Shoppe::Material'

    validates :name, presence: true
    validates :width, numericality: true
    validates :depth, numericality: true

    enum status: [:draft, :under_review, :revision_requested, :rejected, :approved]

    mount_uploader :inspiration_image1, ImageUploader
    mount_uploader :inspiration_image2, ImageUploader
    mount_uploader :inspiration_image3, ImageUploader
    attr_accessor :width_ft, :width_in, :depth_ft, :depth_in
    
    # def width_ft=(value)
    #   @width_ft = value.to_f
    #   self.width = @width_ft * 12 + width_in
    # end

    # def width_in=(value)
    #   @width_in = value.to_f
    #   self.width = width_ft + @width_in
    # end

    def width_ft
      (self.width / 12).to_i
    end

    def width_in
      self.width % 12
    end
    
    # def depth_ft=(value)
    #   @depth_ft = value.to_f
    #   self.depth = @depth_ft * 12 + depth_in
    # end

    # def depth_in=(value)
    #   @depth_in = value.to_f
    #   self.depth = depth_ft + @depth_in
    # end

    def depth_ft
      (self.depth / 12).to_i
    end

    def depth_in
      self.depth % 12
    end

    def create_filters_by(categories, colors, materials, show_all=false)
      unless show_all
        categories ||= []
        colors ||= []
        materials ||= []
        filters_array = []
        categories.try(:each) do |category_id|
          category = ProductCategory.find(category_id)
          filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::ProductCategory').first_or_create
          filters_array << filter
          # category.descendents.try(:each) do |category_child|
          #   filter = Filter.where(filter_element_id: category_child.id, filter_element_type: 'Shoppe::ProductCategory').first_or_create
          #   filters_array << filter
          # end
        end
        colors.try(:each) do |category_id|
          category = Color.find(category_id)
          filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::Color').first_or_create
          filters_array << filter
        end
        materials.try(:each) do |material_id|
          material = Material.find(material_id)
          filter = Filter.where(filter_element_id: material_id, filter_element_type: 'Shoppe::Material').first_or_create
          filters_array << filter
        end
        filters = Filter.where(id: filters_array.map(&:id))
        self.update(filter_ids: filters.ids)
      end
    end

    def product_list_by_filters
      if self.product_category_ids.present? || self.color_ids.present? || self.material_ids.present?
        Product.items_filtering(self.product_category_ids, self.color_ids, self.material_ids) 
      else
        Product.items_filtering
      end
    end 
  
  end
end
