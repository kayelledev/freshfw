class DesignProjectsController < ApplicationController
 load_and_authorize_resource :class => 'DesignProjectsController'

  def create
    @design_project = DesignProject.new(design_project_params)
    @design_project.save
  end

  def project_info
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
    params[:design_project].permit(:name, :inspiration, :inspiration_image1, :inspiration_image2, :inspiration_image3, :user_id, :room_type_id, :width, :depth)
  end
end
