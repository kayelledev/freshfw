module Shoppe
  class ApplicationController < ActionController::Base
    
    # before_action :is_an_admin?    
    before_action :authenticate_user!
    rescue_from CanCan::AccessDenied do |exception|
      flash[:alert] = "Access denied. You are not authorized to access the requested page."
      redirect_to main_app.root_path 
    end


    rescue_from ActiveRecord::DeleteRestrictionError do |e|
      redirect_to request.referer || root_path, :alert => e.message
    end
    
    rescue_from Shoppe::Error do |e|
      @exception = e
      render :layout => 'shoppe/sub', :template => 'shoppe/shared/error'
    end

    protected
    
    # def self.permission
    #   return name = self.name.gsub('Controller','').singularize.split('::').last.constantize.name rescue nil
    # end
    def self.permission
      return name = self.name.gsub('Controller','').singularize.constantize.name  rescue nil
    end

    def self.non_restfull_permission
      self.name
    end



    private


    # def is_an_admin?
    #   if current_user
    #     unless current_user.admin == true
    #       redirect_to main_app.root_path
    #     end
    #   end
    # end

    def login_required
      unless logged_in?
        redirect_to login_path
      end
    end

    def logged_in?
      current_user.is_a?(User)
    end

    def login_from_session
      if session[:shoppe_user_id]
        @user = User.find_by_id(session[:shoppe_user_id])
      end
    end
    
    def login_with_demo_mdoe
      if Shoppe.settings.demo_mode?
        @user = User.first
      end
    end
    
    helper_method :current_user, :logged_in?
    
  end
end
