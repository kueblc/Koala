class SessionsController < ApplicationController
  
  def create
    if user = User.authenticate(params[:email], params[:password])
      session[:user_id] = user.id
      redirect_to :home, :notice => "<div class='success'>Logged in</div>"
    else
      redirect_to new_session_path, :notice => "<div class='errors'>Invalid Credentials</div>"
    end
  end
  
  def destroy
    reset_session
    redirect_to :home, :notice => "<div class='success'>Logged out!</div>"
  end
  
end
