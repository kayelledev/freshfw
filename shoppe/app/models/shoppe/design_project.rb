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
  end
end
