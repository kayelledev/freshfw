require_dependency "shoppe/application_controller"

module Shoppe
  class DesignProjectsController < ApplicationController
    before_filter { @active_nav = :design_projects }
    before_filter { (params[:id] && @design_project = Shoppe::DesignProject.find(params[:id])) ||
                    (session[:design_project_id] && @design_project = Shoppe::DesignProject.find(session[:design_project_id]) )
                  }
  	before_filter :check_session_contain_project, only: [:create]
    load_and_authorize_resource
  	
  	def index
      @design_projects = Shoppe::DesignProject.all
  	end

    def create
      @design_project = Shoppe::DesignProject.new(design_project_params)
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
          format.js
        end
      end
    end

    def update
      if @result = @design_project.update(design_project_params)
        @redirect_url = params[:redirect_to_link]
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

    def select_items
      @parent_categories = ProductCategory.where(parent_id: nil).order("name")
      @categories = ProductCategory.order("name")
      @colors = Color.order("name")
      @materials = Material.order("name")
      @products_categories = @design_project.product_list_by_filters
    end
 

    def project_info
      session[:design_project_id] = params[:id] if params[:id].present?
      @design_project = session[:design_project_id] ? Shoppe::DesignProject.find(session[:design_project_id]) : Shoppe::DesignProject.new
    end

    def room_builder
      @design_project = Shoppe::DesignProject.find(session[:design_project_id])
      @products_categories = @design_project.products.includes(:product_category).order('shoppe_product_categories.name').group_by { |t| t.product_category }
    end

    def add_to_room_builder
      binding.pry
      @design_project.update(product_ids: params[:product_ids])
      redirect_to designer_portal_select_items_path
    end

    def remove_product
      @design_projects_product = Shoppe::DesignProjectsProduct.where( product_id: params[:product_id], design_project_id: params[:design_project_id] ).first
      @design_projects_product.destroy
      @product = @design_projects_product.product
      respond_to do |format|
        format.js
      end
    end

    def items_filtering
      params[:show_all] ||= false
      @products_categories = Shoppe::Product.items_filtering(params[:categories], params[:colors], params[:materials])
      @design_project.create_filters_by(params[:categories], params[:colors], params[:materials], params[:show_all])
      respond_to do |format|
        format.js
      end
    end
    
    def instructions
    end


  	def reject
  	  @design_project.status = :rejected
  	  if @design_project.save
  	  	redirect_to @design_project, :flash => {:notice => 'Design Project status was changed' }
      else
        redirect_to @design_project, :flash => {:notice => 'Design Project status was not changed' }
      end
  	end

  	def approve
  	  @design_project.status = :approved
	  if @design_project.save
  	  	redirect_to designer_portal_path(id: @design_project.id), :flash => {:notice => 'Design Project status was changed' }
      else
        redirect_to designer_portal_path(id: @design_project.id), :flash => {:notice => 'Design Project status was not changed' }
      end
  	end

  	def request_revision
  	  @design_project.status = :revision_requested
  	  if @design_project.save
  	  	redirect_to designer_portal_path(id: @design_project.id), :flash => {:notice => 'Design Project status was changed' }
      else
        redirect_to designer_portal_path(id: @design_project.id), :flash => {:notice => 'Design Project status was not changed' }
      end
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
end
