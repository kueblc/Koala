class ApplicationController < ActionController::Base
  protect_from_forgery
  
  private
  
  def authenticate
    if session[:user_id].nil?
      redirect_to :home, :notice => "<div class='errors'>Must be logged in to view this content!</div>"
    end
  end
  
  def error_listing(var)
    errors = "<div class='errors'>Errors were encountered:<pre>"
    var.errors.full_messages.each do |m|
      errors += "   " + m + "<br>"
    end
    errors += "</div>"
    return errors
  end
  
end
