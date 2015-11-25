module Shoppe
  class DesignProject < ActiveRecord::Base
  	belongs_to :user, :class_name => 'Shoppe::User'
  	belongs_to :product_category, :class_name => 'Shoppe::ProductCategory'
  	has_many  :design_projects_products, :class_name => 'Shoppe::DesignProjectsProduct'
  	has_many  :products, through: :design_projects_products, :class_name => 'Shoppe::Product'

    validates :name, presence: true
    validates :width, numericality: true
    validates :depth, numericality: true

    enum status: [:draft, :under_review, :revision_requested, :rejected, :approved]

    mount_uploader :inspiration_image1, ImageUploader
    mount_uploader :inspiration_image2, ImageUploader
    mount_uploader :inspiration_image3, ImageUploader
  end
end
