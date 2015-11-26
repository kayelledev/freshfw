require_dependency "shoppe/application_controller"

module Shoppe
  class DesignProjectsController < ApplicationController
  	# load_and_authorize_resource
  	before_filter { @active_nav = :design_projects }
  	 before_filter { params[:id] && @design_project = Shoppe::DesignProject.find(params[:id]) }
  	
  	def index
      @design_projects = Shoppe::DesignProject.all
  	end

  	def show
      respond_to do |format|
        format.html
        format.js
      end
  	end

    def select_items
      @categories = ProductCategory.where(parent_id: nil).order("name")
      @colors = Color.order("name")
      @materials = Material.order("name")
      @products_categories = Product.where(color_id: @colors.ids, material_id: @materials.ids, product_category_id: @categories.ids)
                                  .joins(:product_category).order('shoppe_product_categories.name')
                                  .group_by { |t| t.product_category.name }
      respond_to do |format|
        format.html
        format.js
      end
    end

    def room_builder
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
  	  	redirect_to @design_project, :flash => {:notice => 'Design Project status was changed' }
      else
        redirect_to @design_project, :flash => {:notice => 'Design Project status was not changed' }
      end
  	end

  	def request_revision
  	  @design_project.status = :revision_requested
  	  if @design_project.save
  	  	redirect_to @design_project, :flash => {:notice => 'Design Project status was changed' }
      else
        redirect_to @design_project, :flash => {:notice => 'Design Project status was not changed' }
      end
  	end
  end
end
