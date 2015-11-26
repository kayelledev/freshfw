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
