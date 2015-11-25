class DesignProjectsController < ApplicationController
 # load_and_authorize_resource :class => 'DesignProjectsController'

  def create
    @design_project = Shoppe::DesignProject.new(design_project_params)
    @design_project.user = current_user
    @design_project.status = :draft
    @result = @design_project.save
    respond_to do |format|
      if @result = @design_project.save
        format.html { redirect_to designer_portal_path }
        format.js
      else
        format.html { render action: :project_info }
        format.js
      end
    end
  end

  def project_info
    @design_project = Shoppe::DesignProject.new
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
    binding.pry
    @design_project.update(product_categories: params[:categories], 
                          colors: params[:colors],
                          materials: params[:materials])

    respond_to do |format|
      format.js
    end
  end

  def instructions
  end

  private

  def design_project_params
    width = ( params[:width_ft].to_i * 12 ) + params[:width_in].to_i
    depth = ( params[:depth_ft].to_i * 12 ) + params[:depth_in].to_i
    params.require(:design_project).permit(:name, :inspiration, :inspiration_image1, :inspiration_image2, :inspiration_image3, :room_type_id, :url_inspiration_image1, :url_inspiration_image2, :url_inspiration_image3, :inspiration_image1, :inspiration_image2, :inspiration_image3).merge(width: width, depth: depth)
  end
end
