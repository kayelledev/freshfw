class DesignProjectsController < ApplicationController
 # load_and_authorize_resource :class => 'DesignProjectsController'
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

  def save_room_layout
    @design_project = Shoppe::DesignProject.find(session[:design_project_id])
    @design_project.design_projects_products.each do |design_projects_product|
      design_projects_product.layout_posX = nil
      design_projects_product.layout_posY = nil
      design_projects_product.layout_rotation = nil
      design_projects_product.save
    end
    params[:products].each do |product_id, product_params|
      design_projects_product = Shoppe::DesignProjectsProduct.find_or_create_by(product_id: product_id, design_project_id: @design_project.id)
      design_projects_product.layout_posX = product_params['layout_posX'].to_f
      design_projects_product.layout_posY = product_params['layout_posY'].to_f
      design_projects_product.layout_rotation = product_params['layout_rotation'].to_f
      design_projects_product.save
    end
    render json: true
  end

  def save_furniture_board
    @design_project = Shoppe::DesignProject.find(session[:design_project_id])
    @design_project.design_projects_products.each do |design_projects_product|
      design_projects_product.board_posX = nil
      design_projects_product.board_posY = nil
      design_projects_product.board_rotation = nil
      design_projects_product.save
      puts design_projects_product.board_posY
    end
    params[:products].each do |product_id, product_params|
      design_projects_product = Shoppe::DesignProjectsProduct.find_or_create_by(product_id: product_id, design_project_id: @design_project.id)
      design_projects_product.board_posX = product_params['board_posX'].to_f
      design_projects_product.board_posY = product_params['board_posY'].to_f
      design_projects_product.board_rotation = product_params['board_rotation'].to_f
      design_projects_product.save
    end
    render json: true
  end

  def board_submit_room
    @design_project = Shoppe::DesignProject.find(session[:design_project_id])
    @design_projects_products_to_remove = Shoppe::DesignProjectsProduct.where(product_id: params[:ids], design_project_id: @design_project.id).destroy_all
    @ids_to_remove = params[:ids]
    @design_project.status = :draft
    @design_project.save
    render json: true
  end

  def layout_submit_room
    @design_project = Shoppe::DesignProject.find(session[:design_project_id])
    @design_projects_products_to_remove = Shoppe::DesignProjectsProduct.where(product_id: params[:ids], design_project_id: @design_project.id).destroy_all
    @ids_to_remove = params[:ids]
    @design_project.status = :revision_requested
    @design_project.save
    puts '==='
    puts @design_project.status
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
  	@categories = ProductCategory.where(parent_id: nil).order("name")
  	@colors = Color.order("name")
  	@materials = Material.order("name")
    @products_categories = Product.where(color_id: @colors.ids, material_id: @materials.ids, product_category_id: @categories.ids)
                                  .joins(:product_category).order('shoppe_product_categories.name')
                                  .group_by { |t| t.product_category.name }
  end

  def room_builder
    @design_project = Shoppe::DesignProject.find(session[:design_project_id])
    @products_categories = @design_project.products.includes(:product_category).order('shoppe_product_categories.name').group_by { |t| t.product_category }
  end

  def add_to_room_builder
    @design_project.update(product_ids: params[:product_ids])
    redirect_to designer_portal_select_items_path
  end

  def remove_product
    @design_projects_product = Shoppe::DesignProjectsProduct.where( product_id: params[:product_id], design_project_id: params[:design_project_id] ).first
    @design_projects_product.destroy if @design_projects_product
    @product = @design_projects_product.product if @design_projects_product
    respond_to do |format|
      format.js
    end
  end

  # Refactoring too fat controller
  def items_filtering
    @categories = params[:categories].present? ? params[:categories] : ProductCategory.where(parent_id: nil).order("name").ids
    @colors = params[:colors].present? ? params[:colors] : Color.order('name').ids
    @materials = params[:materials].present? ? params[:materials] : Material.order('name').ids
    @products_categories = Product.where(color_id: @colors, material_id: @materials, product_category_id: @categories)
                                  .joins(:product_category).order('shoppe_product_categories.name')
                                  .group_by { |t| t.product_category.name }

    unless params[:categories].nil? && params[:colors].nil? && params[:materials].nil?
      filters_array = []
      params[:categories].try(:each) do |category_id|
        category = ProductCategory.find(category_id)
        filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::ProductCategory').first_or_create
        filters_array << filter
      end
      params[:colors].try(:each) do |category_id|
        category = Color.find(category_id)
        filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::Color').first_or_create
        filters_array << filter
      end
      params[:materials].try(:each) do |category_id|
        category = ProductCategory.find(category_id)
        filter = Filter.where(filter_element_id: category_id, filter_element_type: 'Shoppe::Material').first_or_create
        filters_array << filter
      end
      filters = Filter.where(id: filters_array.map(&:id))
      @design_project.update(filter_ids: filters.ids)
    end
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
    width = ( params[:width_ft].to_i * 12 ) + params[:width_in].to_i
    depth = ( params[:depth_ft].to_i * 12 ) + params[:depth_in].to_i
    params.require(:design_project).permit(:name, :inspiration, :inspiration_image1, :inspiration_image2, :inspiration_image3, :product_category_id, :url_inspiration_image1, :url_inspiration_image2, :url_inspiration_image3, :inspiration_image1, :inspiration_image2, :inspiration_image3).merge(width: width, depth: depth)
  end

end
