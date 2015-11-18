class DesignProjectsController < ApplicationController
  def project_info
  end

  def select_items
  end

  def room_builder
    @project = Shoppe::Product.find_by(sku: 3)
  end

  def instructions
  end
end
