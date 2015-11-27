class DesignProjectsController < ApplicationController
 load_and_authorize_resource 
    before_filter { (params[:id] && @design_project = DesignProject.find(params[:id])) ||
                    (session[:design_project_id] && @design_project = DesignProject.find(session[:design_project_id]) )
                  }
    before_filter :check_session_contain_project, only: [:create]

  def create
    @design_project = DesignProject.new(design_project_params)
    @design_project.user = current_user
    @design_project.status = :draft
    if @result = @design_project.save
      session[:design_project_id] = @design_project.id
      respond_to do |format|
        format.html { redirect_to designer_portal_path }
        format.js
      end
    else
      respond_to do |format|
        format.html { render action: :project_info }
        format.js
      end
    end
  end

  def update
    if @result = @design_project.update(design_project_params)
      respond_to do |format|
        format.html { redirect_to designer_portal_path }
        format.js
      end
    else
      respond_to do |format|
        format.html { render action: :project_info }
        format.js
      end
    end
  end

  def check_session_contain_project
    session[:design_project_id] ? update : create 
  end

  def project_info
    session[:design_project_id] = params[:id] if params[:id].present?
    @design_project = session[:design_project_id] ? DesignProject.find(session[:design_project_id]) : DesignProject.new
  end

  def select_items
    # @products_categories = Product.items_filtering(params[:categories], params[:colors], params[:materials])
  	@parent_categories = ProductCategory.where(parent_id: nil).order("name")
    @categories = ProductCategory.order("name")
  	@colors = Color.order("name")
  	@materials = Material.order("name")
    @products_categories = @design_project.product_list_by_filters
  end

  def room_builder
    @design_project = DesignProject.find(session[:design_project_id])
    @products_categories = @design_project.products.includes(:product_category).order('shoppe_product_categories.name').group_by { |t| t.product_category }
  end

  def add_to_room_builder
    @design_project.update(product_ids: params[:product_ids])
    redirect_to designer_portal_select_items_path
  end

  def remove_product
    @design_projects_product = DesignProjectsProduct.where( product_id: params[:product_id], design_project_id: params[:design_project_id] ).first
    @design_projects_product.destroy
    @product = @design_projects_product.product
    respond_to do |format|
      format.js
    end
  end

  def items_filtering
    @products_categories = Product.items_filtering(params[:categories], params[:colors], params[:materials])
    @design_project.create_filters_by(params[:categories], params[:colors], params[:materials])
    respond_to do |format|
      format.js
    end
  end

  def instructions
  end

  def create_new
    session[:design_project_id] = nil
    redirect_to designer_portal_path
  end

  private

  def design_project_params
    width = ( params[:design_project][:width_ft].to_i * 12 ) + params[:design_project][:width_in].to_i
    depth = ( params[:design_project][:depth_ft].to_i * 12 ) + params[:design_project][:depth_in].to_i
    params.require(:design_project).permit(:name, :inspiration, :inspiration_image1, :inspiration_image2, :inspiration_image3, :product_category_id, :url_inspiration_image1, :url_inspiration_image2, :url_inspiration_image3, :inspiration_image1, :inspiration_image2, :inspiration_image3).merge(width: width, depth: depth)
  end
end
