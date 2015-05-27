class Omniauth::CallbacksController < Devise::OmniauthCallbacksController

  cattr_accessor :auth_data
  before_filter :load_remote_avatar, only: [:user_prompt, :create_user]

  def callback
    if current_user
      current_user.update_attribute(request.env['omniauth.auth'].provider, request.env['omniauth.auth'].uid) unless current_user.twitter
      redirect_to (request.env["omniauth.origin"] || root_path) and return
    end

    @user = User.find_by(request.env['omniauth.auth'].provider => request.env['omniauth.auth'].uid)

    if @user
      if @user.confirmed?
        sign_in @user
      else
        redirect_to new_user_confirmation
      end
      redirect_to request.env['omniauth.origin'] || root_path
    else
      @@auth_data = request.env["omniauth.auth"].to_hash
      redirect_to user_prompt_path
    end
  end

  def user_prompt
    if @@auth_data
      @name = @@auth_data['info']['name']
      @network = @@auth_data['provider']
      @email = @@auth_data.try(:[], 'info').try(:[], 'email')

      first_name = @name.split[0]
      last_name = @name.split[1]

      @user = User.new do |u|
        u.first_name = first_name
        u.last_name = last_name
        u.email = @email
      end
    end
  end

  def create_user
    @name = @@auth_data['info']['name']
    @user = User.build_with_auth_data(@@auth_data, params)
    @user.confirmed_at = Time.now if @user

    if @user.save
      sign_in @user
      flash[:notice] = "Signed in successfuly"
      redirect_to root_path
      @@auth_data = nil
    else
      logger.debug(@user.errors.inspect)
      flash[:notice] = @user.errors.full_messages.join('<br>')
      render :user_prompt
    end

  end

  alias_method :facebook, :callback
  alias_method :twitter,  :callback

  private

  def load_remote_avatar
    return @avatar  = nil unless @@auth_data
    @avatar = @@auth_data.try(:[], "extra").try(:[], 'raw_info').try(:[], "photo_100") || @@auth_data.try(:[], "info").try(:[], 'image') || @@auth_data.try(:[], "extra").try(:[], 'raw_info').try(:[], 'pic') ||
          @@auth_data.try(:[], 'info').try(:[], 'image') || @@auth_data.try(:[], 'extra').try(:[], 'raw_info').try(:[], 'pic_1')
  end
end