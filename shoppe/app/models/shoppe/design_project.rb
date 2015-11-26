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

    def create_filters_by(categories, colors, materials)
      unless categories.nil? && colors.nil? && materials.nil? 
        filters_array = []
        categories.try(:each) do |category_id|
          category = ProductCategory.find(category_id)
          filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::ProductCategory').first_or_create
          filters_array << filter
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
      Product.items_filtering(self.product_category_ids, self.color_ids, self.material_ids)
    end 
  
  end
end
