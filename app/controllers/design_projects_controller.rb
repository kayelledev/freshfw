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
  end

  def room_builder
    @project = Shoppe::Product.find_by(sku: 3)
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
