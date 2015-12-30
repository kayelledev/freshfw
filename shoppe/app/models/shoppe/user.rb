module Shoppe
  class User < ActiveRecord::Base
    rolify
    self.table_name = 'shoppe_users'
    # has_secure_password

    # Validations
    validates :first_name, :presence => true
    validates :last_name, :presence => true
    validates :email_address, :presence => true
    has_and_belongs_to_many :roles, :join_table => :shoppe_roles_users, :after_remove => :check_roles!
    has_many :design_projects, :class_name => 'Shoppe::DesignProject'
    after_create :add_user_role
    after_create :add_product_access_role
    # The user's first name & last name concatenated
    #
    # @return [String]
    def full_name
      "#{first_name} #{last_name}"
    end

    def check_roles!(role)
      if role.name == 'admin' && User.select{|u| u.roles.include? role}.count == 0
        self.errors.add(:base, "You can not delete last admin user")
        raise Exception, "You can not delete last admin user"
      elsif role.name == 'user'
        self.errors.add(:base, "You can not delete user role")
        raise Exception, "You can not delete user role"
      end
    end

    def add_user_role
      self.add_role :user
    end

    def add_product_access_role
      self.add_role :product_access
    end

    # The user's first name & initial of last name concatenated
    #
    # @return [String]
    def short_name
      "#{first_name} #{last_name[0,1]}"
    end

    # Reset the user's password to something random and e-mail it to them
    def reset_password!
      self.password = SecureRandom.hex(8)
      self.password_confirmation = self.password
      self.save!
      Shoppe::UserMailer.new_password(self).deliver_now
    end

    # Attempt to authenticate a user based on email & password. Returns the
    # user if successful otherwise returns false.
    #
    # @param email_address [String]
    # @param paassword [String]
    # @return [Shoppe::User]
    def self.authenticate(email_address, password)
      user = self.where(:email_address => email_address).first
      return false if user.nil?
      return false unless user.authenticate(password)
      user
    end

    def admin?
      self.roles.map(&:name).include? 'admin'
    end

    def delete_own_admin_role?(current_user, role_ids)
      (self == current_user) && self.admin? && !(role_ids.include? Role.where(name: 'admin').first_or_create.id.to_s)
    end
    # def self.build_with_auth_data(auth_data, params)
    #   password = Devise.friendly_token.first(8)
    #   first_name = auth_data['info']['name'].split[0]
    #   last_name = auth_data['info']['name'].split[1]

    #   user = self.new(email_address: params.try(:[], "user").try(:[], "email") || auth_data['info']['email'],
    #            :first_name => first_name, :last_name => last_name,
    #            :password => password ,
    #            :password_confirmation => password,
    #            auth_data['provider'] => auth_data['uid']
    #           )
    # end
    def last_reviews
      reviews.order('updated_at DESC').take(3).map{|review| Product.find(review.product_id) if Shoppe::Product.where(id: review.product_id).present?}.compact
    end

    def project_categories
      ProductCategory.includes(:roles).where('shoppe_roles.id in (?)', self.role_ids).references(:roles)
    end

    def project_categories_with_children
      all_descendents = project_categories.all
      project_categories.all.each{|category| category.descendents.each{|descedent| all_descendents << descedent}}
      all_descendents.flatten.uniq
    end

    def project_category_allowed?(project_category)
      self.project_categories_with_children.map(&:id).include?(project_category.id)
    end
  end
end
