class Ability
  include CanCan::Ability

  def initialize(user)
    if user.present? 
      user.roles.each do |role|
        role.permissions.each do |permission|
          if permission.subject_class == "all"
            can permission.action.to_sym, permission.subject_class.to_sym
          else
            can permission.action.to_sym, permission.subject_class.constantize
          end
        end
      end
    else
      guest_role = Role.where(name: 'guest').first_or_create
      guest_role.permissions.each do |permission|
        if permission.subject_class == "all"
          can permission.action.to_sym, permission.subject_class.to_sym
        else
          can permission.action.to_sym, permission.subject_class.constantize
        end
      end
    end
  end
end
