class DesignProjectsController < ApplicationController
 load_and_authorize_resource :class => 'DesignProjectsController'
 
  def project_info
  end

  def select_items
    @design_project = DesignProject.last # replace with actual product
  	@categories = ProductCategory.where(parent_id: nil).order("name")
  	@colors = Color.order("name")
  	@materials = Material.order("name")
    @products_categories = Product.where(color_id: @colors.ids, material_id: @materials.ids, product_category_id: @categories.ids)
                                  .joins(:product_category).order('shoppe_product_categories.name')
                                  .group_by { |t| t.product_category.name }
    # @products = Product
  end

  def room_builder
    @project = Product.find_by(sku: 3)
  end

  def add_to_room_builder
    @design_project = DesignProject.last
    @design_project.update(product_ids: params[:product_ids])
    select_items
    render "select_items" 
  end

  def items_filtering
    @design_project = DesignProject.last
    @categories = params[:categories].present? ? params[:categories] : ProductCategory.where(parent_id: nil).order("name").ids
    @colors = params[:colors].present? ? params[:colors] : Color.order("name").ids
    @materials = params[:materials].present? ? params[:materials] : Material.order("name").ids
    @products_categories = Product.where(color_id: @colors, material_id: @materials, product_category_id: @categories)
                                  .joins(:product_category).order('shoppe_product_categories.name')
                                  .group_by { |t| t.product_category.name }
    respond_to do |format|
      format.js
    end
  end

  def instructions
  end

end
