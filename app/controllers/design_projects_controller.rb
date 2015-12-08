class DesignProjectsController < ApplicationController
 load_and_authorize_resource
    before_filter { (params[:id] && @design_project = DesignProject.find(params[:id])) ||
                    (session[:design_project_id] && @design_project = DesignProject.find(session[:design_project_id]) )
                  }
    before_filter :check_session_contain_project, only: [:create]
    before_filter :check_user_access, if: :design_project_present?

  def create
    @design_project = DesignProject.new(design_project_params)
    @design_project.user = current_user
    @design_project.status = :draft
    if @result = @design_project.save
      session[:design_project_id] = @design_project.id
      @redirect_url = params[:redirect_to_link]
      respond_to do |format|
        format.html { redirect_to designer_portal_path }
        format.js
      end
    else
      respond_to do |format|
        format.html { render action: :project_info }
        format.js { render status: 422 }
      end
    end
  end

  def check_user_access
    unless current_user.admin? || (@design_project.user && @design_project.user.id == current_user.id)
      flash[:alert] = "Access denied. You are not authorized to access this design project. "
      redirect_to root_path
    end
  end

  def design_project_present?
    @design_project.present?
  end

  def update
    @design_project.assign_attributes(design_project_params)
    @result = @design_project.changed? ? @design_project.save : @design_project.valid?
    if @result
      @redirect_url = params[:redirect_to_link]
      respond_to do |format|
        format.html { redirect_to designer_portal_path }
        format.js
      end
    else
      respond_to do |format|
        format.html { render action: :project_info }
        format.js { render status: 422 }
      end
    end
  end

  def save_room_layout
    @design_project = DesignProject.find(session[:design_project_id])
    @design_project.width =  params[:room_dimensions][:width] if params[:room_dimensions][:width]
    @design_project.depth =  params[:room_dimensions][:depth] if params[:room_dimensions][:depth]
    @design_project.save
    @design_project.design_projects_products.each do |design_projects_product|
      design_projects_product.layout_posX = nil
      design_projects_product.layout_posY = nil
      design_projects_product.layout_rotation = nil
      design_projects_product.save
    end
    params[:products].each do |product_id, product_params|
      design_projects_product = DesignProjectsProduct.find_or_create_by(product_id: product_id, design_project_id: @design_project.id)
      design_projects_product.layout_posX = product_params['layout_posX'].to_f
      design_projects_product.layout_posY = product_params['layout_posY'].to_f
      design_projects_product.layout_rotation = product_params['layout_rotation'].to_f
      design_projects_product.save
    end
    render json: true
  end

  def save_furniture_board
    @design_project = DesignProject.find(session[:design_project_id])
    @design_project.design_projects_products.each do |design_projects_product|
      design_projects_product.board_width = nil
      design_projects_product.board_depth = nil
      design_projects_product.board_posX = nil
      design_projects_product.board_posY = nil
      design_projects_product.board_rotation = nil
      design_projects_product.save
      puts design_projects_product.board_posY
    end
    params[:products].each do |product_id, product_params|
      design_projects_product = DesignProjectsProduct.find_or_create_by(product_id: product_id, design_project_id: @design_project.id)
      design_projects_product.board_width = product_params['board_width'].to_f
      design_projects_product.board_depth = product_params['board_depth'].to_f
      design_projects_product.board_posX = product_params['board_posX'].to_f
      design_projects_product.board_posY = product_params['board_posY'].to_f
      design_projects_product.board_rotation = product_params['board_rotation'].to_f
      design_projects_product.save
    end
    render json: true
  end

  def board_submit_room
    @design_project = DesignProject.find(session[:design_project_id])
    @design_projects_products_to_remove = DesignProjectsProduct.where(product_id: params[:ids], design_project_id: @design_project.id).destroy_all
    @ids_to_remove = params[:ids]
    @design_project.status = :draft
    @design_project.save
    render json: true
  end

  def layout_submit_room
    @design_project = DesignProject.find(session[:design_project_id])
    @design_projects_products_to_remove = DesignProjectsProduct.where(product_id: params[:ids], design_project_id: @design_project.id).destroy_all
    @ids_to_remove = params[:ids]
    @design_project.status = :revision_requested
    @design_project.save
    render json: true
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
    render nothing: true
  end

  def remove_product
    @design_projects_product = DesignProjectsProduct.where( product_id: params[:product_id], design_project_id: params[:design_project_id] ).first
    @design_projects_product.destroy if @design_projects_product
    @product = @design_projects_product.product if @design_projects_product
    respond_to do |format|
      format.js
    end
  end

  def items_filtering
    params[:show_all] ||= false
    @products_categories = Product.items_filtering(params[:categories], params[:colors], params[:materials])
    @design_project.create_filters_by(params[:categories], params[:colors], params[:materials], params[:show_all])
    respond_to do |format|
      format.js
    end
  end

  def instructions
  end

  def create_new
    @design_project = DesignProject.new
    session[:design_project_id] = nil
    redirect_to designer_portal_path
  end

  private

  def design_project_params
    width = ( params[:design_project][:width_ft].to_i * 12 ) + params[:design_project][:width_in].to_i
    depth = ( params[:design_project][:depth_ft].to_i * 12 ) + params[:design_project][:depth_in].to_i
    if params[:save_image] == '0'
      params.require(:design_project).permit(:name, :inspiration, :product_category_id, :url_inspiration_image1, :url_inspiration_image2, :url_inspiration_image3).merge(width: width, depth: depth)
    else
      params.require(:design_project).permit(:name, :inspiration, :inspiration_image1, :inspiration_image2, :inspiration_image3, :product_category_id, :url_inspiration_image1, :url_inspiration_image2, :url_inspiration_image3, :inspiration_image1, :inspiration_image2, :inspiration_image3).merge(width: width, depth: depth)
    end
  end


end
